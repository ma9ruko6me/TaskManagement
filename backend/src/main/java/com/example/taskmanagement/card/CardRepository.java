package com.example.taskmanagement.card;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByStatus(CardStatus status);
}
