package com.dollsay.backend.service;

import com.dollsay.backend.dto.ChatRequest;
import com.dollsay.backend.dto.ChatResponse;
import com.dollsay.backend.model.GuestSession;
import com.dollsay.backend.repository.GuestSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final DeepSeekService deepSeekService;
    private final EmotionAnalyzer emotionAnalyzer;
    private final GuestSessionRepository sessionRepository;
    
    @Value("${app.guest.max-messages}")
    private Integer maxGuestMessages;
    
    public ChatResponse processChat(ChatRequest request) {
        // 1. 检查免登录用户限制
        if (request.getIsGuest()) {
            GuestSession session = sessionRepository.findById(request.getSessionId())
                .orElseGet(() -> createNewSession(request.getSessionId()));
            
            if (session.getMessagesCount() >= maxGuestMessages) {
                throw new RuntimeException("MESSAGES_LIMIT_EXCEEDED");
            }
            
            session.setMessagesCount(session.getMessagesCount() + 1);
            sessionRepository.save(session);
        }
        
        // 2. 调用AI生成回复
        String aiReply = deepSeekService.generateReply(request.getMessage());
        
        // 3. 分析情绪
        String emotion = emotionAnalyzer.analyze(aiReply);
        
        // 4. 计算剩余消息数
        Integer remaining = null;
        if (request.getIsGuest()) {
            GuestSession session = sessionRepository.findById(request.getSessionId()).orElseThrow();
            remaining = maxGuestMessages - session.getMessagesCount();
        }
        
        // 5. 构建响应
        return ChatResponse.builder()
            .id(UUID.randomUUID().toString())
            .reply(aiReply)
            .emotion(emotion)
            .remainingMessages(remaining)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    private GuestSession createNewSession(String sessionId) {
        GuestSession session = new GuestSession();
        session.setId(sessionId);
        session.setMessagesCount(0);
        session.setChatHistory("[]");
        return session;
    }
}
