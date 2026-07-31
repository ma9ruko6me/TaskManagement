package com.example.taskmanagement.card;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    public List<CardResponse> findCards(@RequestParam(required = false) CardStatus status) {
        return cardService.findCards(status);
    }

    @GetMapping("/{id}")
    public CardResponse findById(@PathVariable Long id) {
        return cardService.findById(id);
    }
}
