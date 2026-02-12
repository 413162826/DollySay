import React, { useEffect, useState, useRef } from 'react';

/**
 * 灵动月亮组件 (Alive Moon)
 * 特性：
 * 1. 眼球注视 (Eye Tracking): 眼睛会跟随鼠标位置微微转动
 * 2. 物理眨眼 (Physics Blinking): 随机眨眼间隔，自然闭合
 * 3. 情感瞳孔 (Emotional Pupil): 根据情绪改变瞳孔大小和形状
 * 4. 水灵高光 (Shiny Eyes): 多层高光渲染，营造玻璃质感
 */
export default function MoonMascot({ emotion = 'neutral', onClick }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isBlinking, setIsBlinking] = useState(false);
    const containerRef = useRef(null);

    // 1. 鼠标追踪逻辑 (为了性能，限制更新频率或范围)
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // 计算鼠标相对于组件中心的坐标 (-1 到 1)
            const x = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
            const y = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // 2. 随机眨眼逻辑
    useEffect(() => {
        let timeout;
        const triggerBlink = () => {
            setIsBlinking(true);
            timeout = setTimeout(() => {
                setIsBlinking(false);
                // 随机下一次眨眼时间 (2-6秒)
                timeout = setTimeout(triggerBlink, 2000 + Math.random() * 4000);
            }, 150 + Math.random() * 100); // 眨眼持续时间 150-250ms
        };
        timeout = setTimeout(triggerBlink, 3000);
        return () => clearTimeout(timeout);
    }, []);

    // 计算眼球偏移量 (限制最大移动距离)
    const eyeOffsetX = Math.max(-10, Math.min(10, mousePos.x * 15));
    const eyeOffsetY = Math.max(-10, Math.min(10, mousePos.y * 15));

    // 情绪配置
    const getEmotionConfig = () => {
        switch (emotion) {
            case 'happy': return { eyeShape: 'curve', mouth: 'd', pupilSize: 1.1 };
            case 'sad': return { eyeShape: 'droop', mouth: 'frown', pupilSize: 0.9 };
            case 'surprised': return { eyeShape: 'wide', mouth: 'o', pupilSize: 0.8 }; // 惊讶时瞳孔缩小
            case 'thinking': return { eyeShape: 'lookUp', mouth: 'line', pupilSize: 1.0 };
            default: return { eyeShape: 'normal', mouth: 'smile', pupilSize: 1.0 };
        }
    };
    const config = getEmotionConfig();

    return (
        <div
            ref={containerRef}
            className="alive-moon-container"
            onClick={onClick}
        >
            <svg viewBox="0 0 400 400" className="moon-svg">
                <defs>
                    {/* 月亮本体渐变 */}
                    <linearGradient id="bodyGradient" x1="20%" y1="20%" x2="80%" y2="80%">
                        <stop offset="0%" stopColor="#FFF9F0" />
                        <stop offset="100%" stopColor="#FFD59E" />
                    </linearGradient>

                    {/* 阴影渐变 */}
                    <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="70%" stopColor="rgba(166, 139, 204, 0)" />
                        <stop offset="100%" stopColor="rgba(166, 139, 204, 0.2)" />
                    </radialGradient>

                    {/* 眼睛高光滤镜 */}
                    <filter id="eyeGlow">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* --- 1. 背景光晕 (呼吸动画) --- */}
                <circle cx="200" cy="200" r="140" fill="url(#shadowGradient)" className="breathing-glow" />

                {/* --- 2. 月亮主体 --- */}
                {/* 使用Path绘制月牙形状 */}
                <path
                    d="M260 60 
                       C 160 60, 80 140, 80 240 
                       C 80 340, 160 420, 260 420 
                       C 320 420, 360 380, 380 340
                       C 280 340, 200 280, 200 200
                       C 200 120, 280 60, 380 60
                       C 360 20, 320 -20, 260 60 Z"
                    fill="url(#bodyGradient)"
                    transform="translate(-20, -20) scale(0.9)"
                    className="moon-body"
                />

                {/* --- 3. 眼睛容器 (核心灵动部分) --- */}
                <g transform="translate(-10, 20)">
                    {/* 左眼 */}
                    <g transform={`translate(140, 180)`}>
                        {renderEye(isBlinking, eyeOffsetX, eyeOffsetY, config, true)}
                    </g>

                    {/* 右眼 */}
                    <g transform={`translate(240, 180)`}>
                        {renderEye(isBlinking, eyeOffsetX, eyeOffsetY, config, false)}
                    </g>
                </g>

                {/* --- 4. 嘴巴 --- */}
                <g transform="translate(190, 240)">
                    {renderMouth(config.mouth)}
                </g>

                {/* --- 5. 腮红 --- */}
                <ellipse cx="130" cy="220" rx="25" ry="15" fill="#FFB7B2" opacity="0.4" className="blush" />
                <ellipse cx="250" cy="220" rx="25" ry="15" fill="#FFB7B2" opacity="0.4" className="blush" />

            </svg>

            <style>{`
                .alive-moon-container {
                    width: 350px;
                    height: 350px;
                    cursor: pointer;
                    position: relative;
                    /* 整体悬浮动画 */
                    animation: moonFloat 6s ease-in-out infinite;
                }
                
                .moon-body {
                    filter: drop-shadow(0 10px 20px rgba(109, 87, 138, 0.3));
                }

                .breathing-glow {
                    animation: glowPulse 4s ease-in-out infinite;
                    transform-origin: center;
                }

                @keyframes moonFloat {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                }

                @keyframes glowPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }

                .pupil {
                    transition: r 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </div>
    );
}

// 渲染单个眼睛 (复杂的图层叠加)
function renderEye(isBlinking, offsetX, offsetY, config, isLeft) {
    if (isBlinking) {
        // 闭眼状态：一条弧线
        return <path d="M-25 0 Q 0 10, 25 0" stroke="#5D4E6D" strokeWidth="6" fill="none" strokeLinecap="round" />;
    }

    if (config.eyeShape === 'curve') {
        // 笑眼 (弯弯的眼睛)
        return <path d="M-25 5 Q 0 -15, 25 5" stroke="#5D4E6D" strokeWidth="6" fill="none" strokeLinecap="round" />;
    }

    // 睁眼状态：眼白 -> 虹膜 -> 瞳孔 -> 高光
    return (
        <g>
            {/* 1. 眼白 (作为遮罩或底色) */}
            <circle r="28" fill="#FFF" />

            {/* 2. 眼球整体 (跟随鼠标移动) */}
            <g transform={`translate(${offsetX}, ${offsetY})`}>

                {/* 虹膜 (Iris) - 深紫色 */}
                <circle r={16 * config.pupilSize} fill="#5D4E6D" className="pupil" />

                {/* 瞳孔 (Pupil) - 更深色 */}
                <circle r={8 * config.pupilSize} fill="#2D2438" />

                {/* 3. 高光 (Highlight) - 灵魂所在 */}
                {/* 主高光 (左上) */}
                <circle cx="-6" cy="-6" r="5" fill="white" opacity="0.9" />
                {/* 副高光 (右下，小一点) */}
                <circle cx="6" cy="6" r="2" fill="white" opacity="0.7" />
            </g>

            {/* 4. 眼眶/眼线 (可选，增加神态) */}
            {/* <circle r="28" fill="none" stroke="#5D4E6D" strokeWidth="1" opacity="0.1" /> */}
        </g>
    );
}

// 渲染嘴巴
function renderMouth(type) {
    const color = "#5D4E6D";
    const width = 6;
    switch (type) {
        case 'smile':
            return <path d="M-20 0 Q 0 20, 20 0" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />;
        case 'd': // 开心大笑
            return <path d="M-20 0 Q 0 25, 20 0 Z" fill="#FF8A80" stroke={color} strokeWidth="3" strokeLinejoin="round" />;
        case 'frown': // 难过
            return <path d="M-20 10 Q 0 -10, 20 10" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />;
        case 'o': // 惊讶
            return <ellipse cx="0" cy="5" rx="10" ry="15" stroke={color} strokeWidth={width} fill="none" />;
        case 'line': // 思考
            return <path d="M-15 5 L 15 5" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />;
        default:
            return <path d="M-20 0 Q 0 15, 20 0" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />;
    }
}
