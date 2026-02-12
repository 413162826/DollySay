package com.dollsay.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class DeepSeekService {
    
    @Value("${deepseek.api-key}")
    private String apiKey;
    
    @Value("${deepseek.api-url}")
    private String apiUrl;
    
    @Value("${deepseek.model}")
    private String model;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public String generateReply(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(
            Map.of("role", "system", "content", buildSystemPrompt()),
            Map.of("role", "user", "content", userMessage)
        ));
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 150);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            
            throw new RuntimeException("DeepSeek API返回格式异常");
            
        } catch (Exception e) {
            log.error("调用DeepSeek API失败", e);
            return "抱歉,我现在有点累了,稍后再聊好吗?";
        }
    }
    
    private String buildSystemPrompt() {
        return "你是一个温暖的情感陪伴玩偶,名叫小月。" +
               "你善于倾听和安慰,回复要温柔、简短(50字以内),多用共情语言。" +
               "不要问太多问题,重点是陪伴和理解。";
    }
}
