package com.example.taskmanagement.card;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CardResponse(
        Long id,
        CardStatus status,
        String title,
        String description,
        LocalDate dueDate,
        Priority priority,
        Integer position,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static CardResponse from(Card card) {
        return new CardResponse(
                card.getId(),
                card.getStatus(),
                card.getTitle(),
                card.getDescription(),
                card.getDueDate(),
                card.getPriority(),
                card.getPosition(),
                card.getCreatedAt(),
                card.getUpdatedAt());
    }
}
