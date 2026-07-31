package com.example.taskmanagement.card;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CardService {

    private final CardRepository cardRepository;

    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public List<CardResponse> findCards(CardStatus status) {
        List<Card> cards = status == null
                ? cardRepository.findAll()
                : cardRepository.findByStatus(status);
        return cards.stream().map(CardResponse::from).toList();
    }

    public CardResponse findById(Long id) {
        Card card = cardRepository.findById(id).orElseThrow(() -> new CardNotFoundException(id));
        return CardResponse.from(card);
    }
}
