package com.example.taskmanagement.card;

public class CardNotFoundException extends RuntimeException {

    public CardNotFoundException(Long id) {
        super("Card not found: id=" + id);
    }
}
