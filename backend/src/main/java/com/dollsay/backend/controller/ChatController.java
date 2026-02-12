package com.dollsay.backend.controller;

import com.dollsay.backend.dto.ChatRequest;
import com.dollsay.backend.dto.ChatResponse;
import com.dollsay.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return chatService.processChat(request);
    }
}
