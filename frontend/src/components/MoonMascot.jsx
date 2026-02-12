import React, { useEffect, useState, useRef } from 'react';
import { MOON_ACTIONS, CSS_ANIMATIONS } from './MoonActions';
import useMoonBehavior from './useMoonBehavior';

/**
 * Cosmic Softie (宇宙软萌兽) - 智能状态版
 * 新增特性：
 * 1. 休眠模式 (Idle): 眼睛随机游离，不跟随鼠标
 * 2. 唤醒模式 (Awake): 眼睛紧跟鼠标，持续10秒
 */
export default function MoonMascot({ emotion: externalEmotion, onClick }) {
    const { currentAction, triggerAction, handleInteraction, isAwake } = useMoonBehavior(onClick);

    // === 鼠标追踪 (Awake) ===
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current || !isAwake) return; // 休眠时不更新鼠标位置
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2),
                y: (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isAwake]);

    // === 随机游离 (Idle) ===
    const [idleEyePos, setIdleEyePos] = useState({ x: 0, y: 0 });
    useEffect(() => {
        let timeoutId;
        if (!isAwake) {
            const wander = () => {
                const targetX = (Math.random() - 0.5);
                const targetY = (Math.random() - 0.5) * 0.5;
                setIdleEyePos({ x: targetX, y: targetY });
                timeoutId = setTimeout(wander, 2000 + Math.random() * 4000);
            };
            timeoutId = setTimeout(wander, 1000);
        }
        return () => clearTimeout(timeoutId);
    }, [isAwake]);

    // 计算最终眼球位置
    const targetPos = isAwake ? mousePos : idleEyePos;
    // 限制眼球移动范围
    const eyeOffsetX = Math.max(-12, Math.min(12, targetPos.x * 20));
    const eyeOffsetY = Math.max(-12, Math.min(12, targetPos.y * 20));

    // 右键菜单
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
    };
    useEffect(() => {
        const closeMenu = () => setContextMenu({ visible: false, x: 0, y: 0 });
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const activeEmotion = currentAction.emotion !== 'neutral' ? currentAction.emotion : (externalEmotion || 'neutral');

    return (
        <div
            ref={containerRef}
            className="cosmic-mascot-container"
            onContextMenu={handleContextMenu}
        >
            <style>{CSS_ANIMATIONS}</style>

            <div className={`mascot-animator`} style={{
                animation: `${currentAction.animation} ${currentAction.duration}ms ease-in-out infinite`,
                animationIterationCount: currentAction.duration > 0 ? 1 : 'infinite'
            }}>
                <svg viewBox="0 0 500 500" className="mascot-svg">
                    <defs>
                        <linearGradient id="softSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF5E6" />
                            <stop offset="60%" stopColor="#FFE0B2" />
                            <stop offset="100%" stopColor="#FFCCBC" />
                        </linearGradient>
                        <linearGradient id="earGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFCCBC" />
                            <stop offset="100%" stopColor="#FFF5E6" />
                        </linearGradient>
                    </defs>

                    <circle cx="250" cy="250" r="180" fill="url(#softSkin)" opacity="0.15" className="aura-pulse" />

                    <g transform="translate(250, 250)">
                        <path d="M-80 -120 Q -120 -180, -140 -120 Q -150 -80, -100 -80" fill="url(#earGradient)" />
                        <path d="M80 -120 Q 120 -180, 140 -120 Q 150 -80, 100 -80" fill="url(#earGradient)" />
                    </g>

                    <ellipse cx="250" cy="270" rx="130" ry="120" fill="url(#softSkin)"
                        filter="drop-shadow(0 15px 25px rgba(186, 156, 122, 0.3))"
                        onClick={() => handleInteraction('click', 'body')}
                        style={{ cursor: 'pointer' }}
                    />

                    <g transform="translate(250, 260)">
                        <g transform="translate(-50, 0)" onClick={() => handleInteraction('click', 'head')}>
                            {renderEye(activeEmotion, eyeOffsetX, eyeOffsetY)}
                        </g>
                        <g transform="translate(50, 0)" onClick={() => handleInteraction('click', 'head')}>
                            {renderEye(activeEmotion, eyeOffsetX, eyeOffsetY)}
                        </g>

                        <ellipse cx="-70" cy="40" rx="15" ry="8" fill="#FFAB91" opacity="0.5" />
                        <ellipse cx="70" cy="40" rx="15" ry="8" fill="#FFAB91" opacity="0.5" />

                        <g transform="translate(0, 50)" onClick={(e) => { e.stopPropagation(); handleInteraction('click', 'mouth'); }}>
                            <circle r="30" fill="transparent" style={{ cursor: 'pointer' }} />
                            {renderMouth(activeEmotion)}
                        </g>
                    </g>

                    <circle cx="130" cy="320" r="20" fill="#FFE0B2" />
                    <circle cx="370" cy="320" r="20" fill="#FFE0B2" />

                    {currentAction.particles === 'heart' && (
                        <g className="particles-hearts">
                            <text x="200" y="150" fill="#FF5252" fontSize="30" className="particle-p1">❤️</text>
                            <text x="300" y="120" fill="#FF5252" fontSize="20" className="particle-p2">❤️</text>
                        </g>
                    )}
                    {currentAction.particles === 'stars' && (
                        <g className="particles-stars">
                            <text x="180" y="100" fontSize="30" className="particle-p1">✨</text>
                            <text x="320" y="100" fontSize="40" className="particle-p2">🌟</text>
                            <text x="250" y="80" fontSize="25" className="particle-p3">✨</text>
                        </g>
                    )}

                </svg>
            </div>

            {contextMenu.visible && (
                <div
                    className="action-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="menu-title">🎭 动作调试</div>
                    {Object.keys(MOON_ACTIONS).map(key => (
                        <div
                            key={key}
                            className="menu-item"
                            onClick={() => {
                                triggerAction(key);
                                setContextMenu({ visible: false, x: 0, y: 0 });
                            }}
                        >
                            {key}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .cosmic-mascot-container {
                    width: 450px;
                    height: 450px;
                    position: relative;
                }
                .mascot-animator {
                    width: 100%;
                    height: 100%;
                    transform-origin: center bottom;
                    transition: transform 0.5s ease;
                }
                .aura-pulse {
                    animation: aura-breathe 4s infinite alternate;
                }
                @keyframes aura-breathe {
                    from { transform: scale(1); opacity: 0.1; }
                    to { transform: scale(1.1); opacity: 0.25; }
                }
                
                .particle-p1 { animation: particle-float 1s forwards; --tx: -20px; --ty: -50px; }
                .particle-p2 { animation: particle-float 1.2s forwards; --tx: 20px; --ty: -60px; }
                .particle-p3 { animation: particle-float 1.5s forwards; --tx: 0px; --ty: -80px; }

                .action-menu {
                    position: fixed;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    padding: 8px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    z-index: 9999;
                    min-width: 120px;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .menu-title {
                    font-size: 12px;
                    color: #999;
                    padding: 4px 8px;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 4px;
                }
                .menu-item {
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #555;
                    border-radius: 6px;
                    transition: background 0.2s;
                }
                .menu-item:hover {
                    background: #f0f0f5;
                    color: #a980f5;
                }
            `}</style>
        </div>
    );
}

function renderEye(emotion, dx, dy) {
    let pupilSize = 1;
    let eyeScale = 1;

    switch (emotion) {
        case 'shy': return <path d="M-15 0 Q 0 -15, 15 0" stroke="#5d4e6d" strokeWidth="4" fill="none" strokeLinecap="round" />;
        case 'surprised': pupilSize = 0.5; eyeScale = 1.1; break;
        case 'super-happy': return <path d="M0 -15 L 4 -4 L 15 -4 L 8 4 L 12 15 L 0 8 L -12 15 L -8 4 L -15 -4 L -4 -4 Z" fill="#5d4e6d" />;
        case 'dizzy': return <path d="M-10 -10 L 10 10 M 10 -10 L -10 10" stroke="#5d4e6d" strokeWidth="3" />;
        case 'happy': return <path d="M-15 5 Q 0 -10, 15 5" stroke="#5d4e6d" strokeWidth="4" fill="none" strokeLinecap="round" />;
        default: break;
    }

    return (
        <g transform={`scale(${eyeScale})`}>
            <circle r="22" fill="#FFF" />
            <g style={{
                transform: `translate(${dx}px, ${dy}px)`,
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <circle r={12 * pupilSize} fill="#5d4e6d" />
                <circle cx="-5" cy="-5" r="4" fill="white" opacity="0.9" />
            </g>
        </g>
    );
}

function renderMouth(emotion) {
    const color = "#5d4e6d";
    const width = 4;
    switch (emotion) {
        case 'happy':
        case 'shy': return <path d="M-15 0 Q 0 15, 15 0" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />;
        case 'surprised': return <ellipse cx="0" cy="5" rx="8" ry="12" stroke={color} strokeWidth={width} fill="none" />;
        case 'super-happy': return <path d="M-15 0 Q 0 20, 15 0 Z" fill="#FF8A80" />;
        default: return <path d="M-10 0 Q 0 10, 10 0" stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" />;
    }
}
