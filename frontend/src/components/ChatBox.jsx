import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/api';
import MessageBubble from './MessageBubble';

export default function ChatBox({ onEmotionChange }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [remainingMessages, setRemainingMessages] = useState(20);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // 添加用户消息
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        // 切换为"思考"表情
        onEmotionChange?.('thinking');
        setIsLoading(true);

        try {
            const response = await sendMessage(userMessage);

            // 添加AI回复
            setMessages(prev => [...prev, { role: 'ai', content: response.reply }]);

            // 切换表情
            onEmotionChange?.(response.emotion);

            // 更新剩余消息数
            if (response.remainingMessages !== null) {
                setRemainingMessages(response.remainingMessages);
            }

        } catch (error) {
            console.error('发送消息失败', error);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: '抱歉，我现在有点累了，稍后再聊好吗？'
            }]);
            onEmotionChange?.('sad');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-box">
            <div className="messages-container">
                {messages.map((msg, index) => (
                    <MessageBubble
                        key={index}
                        role={msg.role}
                        content={msg.content}
                    />
                ))}
                {isLoading && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="和我说说吧，我在听..."
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    发送
                </button>
            </div>

            {remainingMessages <= 5 && remainingMessages > 0 && (
                <div className="remaining-hint">
                    免费体验还剩{remainingMessages}条消息
                </div>
            )}
        </div>
    );
}
