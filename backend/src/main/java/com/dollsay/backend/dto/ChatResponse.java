package com.dollsay.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatResponse {
    private String id;
    private String reply;
    private String emotion;  // neutral, happy, sad, thinking, surprised
    private Integer remainingMessages;  // 免登录用户剩余消息数
    private LocalDateTime timestamp;
}
