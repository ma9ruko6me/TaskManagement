// ==== 状態管理 ====
// ボードの概念は持たず、単一カンバン（未着手／進行中／完了）のみを扱う
const STORAGE_KEY = 'tm_prototype_state_v2';

function seedState() {
  const now = new Date().toISOString();
  return {
    lists: [
      { id: 'l1', title: '未着手', order: 0 },
      { id: 'l2', title: '進行中', order: 1 },
      { id: 'l3', title: '完了', order: 2 },
    ],
    cards: [
      { id: 'c1', listId: 'l1', title: '要件定義書のレビュー', description: '', dueDate: '2026-08-05', priority: '高', order: 0, createdAt: now },
      { id: 'c2', listId: 'l1', title: '画面設計のワイヤーフレーム作成', description: '', dueDate: '', priority: '中', order: 1, createdAt: now },
      { id: 'c3', listId: 'l1', title: 'データベース設計の学習', description: '', dueDate: '2026-08-10', priority: '中', order: 2, createdAt: now },
      { id: 'c4', listId: 'l2', title: 'プロトタイプ実装', description: 'HTML/CSS/JSでカンバンのプロトタイプを作る', dueDate: '2026-08-01', priority: '高', order: 0, createdAt: now },
      { id: 'c5', listId: 'l3', title: 'プロジェクトの目的整理', description: '', dueDate: '', priority: '低', order: 0, createdAt: now },
    ],
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // 壊れていた場合は初期データに戻す
    }
  }
  const initial = seedState();
  saveState(initial);
  return initial;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let currentCardId = null;
let sortMode = 'manual'; // 'manual' | 'dueDate' | 'priority'

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}

// ==== カンバンビュー ====
const kanban = document.getElementById('kanban');
const sortSelect = document.getElementById('sortSelect');

sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  renderKanban();
});

function getSortedLists() {
  return [...state.lists].sort((a, b) => a.order - b.order);
}

const PRIORITY_RANK = { '高': 0, '中': 1, '低': 2 };

function getCardsForList(listId) {
  const cards = state.cards.filter(c => c.listId === listId);

  if (sortMode === 'dueDate') {
    return cards.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }

  if (sortMode === 'priority') {
    return cards.sort((a, b) => (PRIORITY_RANK[a.priority] ?? 99) - (PRIORITY_RANK[b.priority] ?? 99));
  }

  return cards.sort((a, b) => a.order - b.order);
}

function renderKanban() {
  kanban.innerHTML = '';

  getSortedLists().forEach(list => {
    const column = document.createElement('div');
    column.className = 'list-column';
    column.dataset.listId = list.id;

    const titleRow = document.createElement('div');
    titleRow.className = 'list-title';
    titleRow.textContent = list.title;
    column.appendChild(titleRow);

    const cardList = document.createElement('div');
    cardList.className = 'card-list';
    cardList.dataset.listId = list.id;

    getCardsForList(list.id).forEach(card => {
      cardList.appendChild(renderCardEl(card));
    });

    column.appendChild(cardList);

    const addCardBtn = document.createElement('button');
    addCardBtn.className = 'add-card-btn';
    addCardBtn.textContent = '＋ カードを追加';
    addCardBtn.addEventListener('click', () => addCard(list.id));
    column.appendChild(addCardBtn);

    attachListDropZone(cardList);

    kanban.appendChild(column);
  });
}

function renderCardEl(card) {
  const el = document.createElement('div');
  el.className = 'card-item';
  el.draggable = true;
  el.dataset.cardId = card.id;

  const titleEl = document.createElement('div');
  titleEl.className = 'card-title';
  titleEl.textContent = card.title;
  el.appendChild(titleEl);

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  if (card.priority) {
    const pb = document.createElement('span');
    pb.className = 'badge priority-' + card.priority;
    pb.textContent = card.priority;
    meta.appendChild(pb);
  }
  if (card.dueDate) {
    const db = document.createElement('span');
    db.className = 'badge due';
    db.textContent = card.dueDate;
    meta.appendChild(db);
  }

  el.appendChild(meta);

  el.addEventListener('click', () => openCardModal(card.id));

  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => el.classList.add('dragging'), 0);
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.list-column').forEach(c => c.classList.remove('drag-over'));
  });

  return el;
}

// ==== ドラッグ&ドロップ ====
function attachListDropZone(cardListEl) {
  cardListEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    cardListEl.closest('.list-column').classList.add('drag-over');

    const dragging = document.querySelector('.card-item.dragging');
    if (!dragging) return;
    const afterEl = getDragAfterElement(cardListEl, e.clientY);
    if (afterEl == null) {
      cardListEl.appendChild(dragging);
    } else {
      cardListEl.insertBefore(dragging, afterEl);
    }
  });

  cardListEl.addEventListener('dragleave', (e) => {
    if (e.target === cardListEl) {
      cardListEl.closest('.list-column').classList.remove('drag-over');
    }
  });

  cardListEl.addEventListener('drop', (e) => {
    e.preventDefault();
    cardListEl.closest('.list-column').classList.remove('drag-over');
    const newListId = cardListEl.dataset.listId;

    // DOM上の現在の並び順から order / listId を更新する
    const orderedIds = Array.from(cardListEl.querySelectorAll('.card-item')).map(el => el.dataset.cardId);
    orderedIds.forEach((id, index) => {
      const card = state.cards.find(c => c.id === id);
      if (card) {
        card.listId = newListId;
        card.order = index;
      }
    });
    saveState(state);

    // ドラッグでの並び替えは手動順として扱う
    sortMode = 'manual';
    sortSelect.value = 'manual';
    renderKanban();
  });
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.card-item:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ==== カードの追加 ====
function addCard(listId) {
  openCardModal(null, listId);
}

// ==== カード詳細／追加モーダル（共通） ====
const cardModalOverlay = document.getElementById('cardModalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalDueDate = document.getElementById('modalDueDate');
const modalPriority = document.getElementById('modalPriority');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveCardBtn = document.getElementById('saveCardBtn');
const deleteCardBtn = document.getElementById('deleteCardBtn');

let modalTargetListId = null; // 新規追加時の追加先リスト

// cardId を渡せば編集モード、null + listId を渡せば新規追加モードで開く
function openCardModal(cardId, listId) {
  currentCardId = cardId;
  modalTargetListId = listId || null;

  const card = cardId ? state.cards.find(c => c.id === cardId) : null;

  modalTitle.value = card ? card.title : '';
  modalDescription.value = card ? (card.description || '') : '';
  modalDueDate.value = card ? (card.dueDate || '') : '';
  modalPriority.value = card ? (card.priority || '中') : '中';

  deleteCardBtn.hidden = !card;

  cardModalOverlay.hidden = false;
  modalTitle.focus();
}

function closeCardModal() {
  cardModalOverlay.hidden = true;
  currentCardId = null;
  modalTargetListId = null;
}

closeModalBtn.addEventListener('click', closeCardModal);
cardModalOverlay.addEventListener('click', (e) => {
  if (e.target === cardModalOverlay) closeCardModal();
});

saveCardBtn.addEventListener('click', () => {
  const title = modalTitle.value.trim();
  if (!title) {
    alert('タイトルを入力してください');
    return;
  }

  if (currentCardId) {
    const card = state.cards.find(c => c.id === currentCardId);
    card.title = title;
    card.description = modalDescription.value;
    card.dueDate = modalDueDate.value;
    card.priority = modalPriority.value;
  } else {
    const cards = getCardsForList(modalTargetListId);
    const order = cards.length ? Math.max(...cards.map(c => c.order)) + 1 : 0;
    state.cards.push({
      id: uid('c'),
      listId: modalTargetListId,
      title,
      description: modalDescription.value,
      dueDate: modalDueDate.value,
      priority: modalPriority.value,
      order,
      createdAt: new Date().toISOString(),
    });
  }

  saveState(state);
  closeCardModal();
  renderKanban();
});

deleteCardBtn.addEventListener('click', () => {
  if (!confirm('このカードを削除しますか？')) return;
  state.cards = state.cards.filter(c => c.id !== currentCardId);
  saveState(state);
  closeCardModal();
  renderKanban();
});

// ==== 初期表示 ====
renderKanban();
