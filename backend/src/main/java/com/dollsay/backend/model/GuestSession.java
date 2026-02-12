package com.dollsay.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "guest_sessions")
public class GuestSession {
    @Id
    private String id; // sessionId

    @Column(name = "messages_count")
    private Integer messagesCount = 0;

    @Column(name = "chat_history", columnDefinition = "TEXT")
    private String chatHistory = "[]"; // JSON数组字符串

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
