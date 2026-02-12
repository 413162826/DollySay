package com.dollsay.backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmotionAnalyzer {
    
    public String analyze(String text) {
        if (text == null) {
            return "neutral";
        }
        
        String lower = text.toLowerCase();
        
        // 开心
        if (lower.contains("开心") || lower.contains("太好了") || 
            lower.contains("哈哈") || lower.contains("真棒")) {
            return "happy";
        }
        
        // 难过
        if (lower.contains("难过") || lower.contains("抱歉") || 
            lower.contains("遗憾") || lower.contains("心疼")) {
            return "sad";
        }
        
        // 惊讶
        if (lower.contains("哇") || lower.contains("真的吗") || 
            lower.contains("不会吧") || lower.contains("天啊")) {
            return "surprised";
        }
        
        // 思考
        if (lower.contains("让我想想") || lower.contains("可能") || 
            lower.contains("也许")) {
            return "thinking";
        }
        
        return "neutral";
    }
}
