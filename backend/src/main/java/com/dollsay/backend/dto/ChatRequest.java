package com.dollsay.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "消息内容不能为空")
    private String message;
    
    @NotBlank(message = "会话ID不能为空")
    private String sessionId;
    
    @NotNull(message = "isGuest不能为空")
    private Boolean isGuest;
}
