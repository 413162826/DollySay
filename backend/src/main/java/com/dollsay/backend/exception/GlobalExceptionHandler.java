package com.dollsay.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "INVALID_REQUEST");
        error.put("message", ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
        error.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> error = new HashMap<>();
        
        if ("MESSAGES_LIMIT_EXCEEDED".equals(ex.getMessage())) {
            error.put("error", "MESSAGES_LIMIT_EXCEEDED");
            error.put("message", "免费用户已达到20条消息限制,请登录继续");
        } else {
            error.put("error", "AI_SERVICE_ERROR");
            error.put("message", "AI服务暂时不可用,请稍后重试");
        }
        
        error.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
