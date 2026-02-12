import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

// V1阶段如果没有Lottie，用Emoji
const EMOJI_EMOTIONS = {
    neutral: '🌙',
    happy: '😊🌙',
    sad: '😢🌙',
    thinking: '🤔🌙',
    surprised: '😮🌙'
};

export default function Doll({ emotion = 'neutral', onClick }) {
    const [isClicked, setIsClicked] = useState(false);

    // 点击弹跳动画
    const bounce = useSpring({
        transform: isClicked
            ? 'translateY(-20px) scale(1.1)'
            : 'translateY(0px) scale(1)',
        config: { tension: 300, friction: 10 },
        onRest: () => setIsClicked(false)
    });

    const handleClick = () => {
        setIsClicked(true);
        onClick?.();
    };

    return (
        <animated.div
            style={bounce}
            onClick={handleClick}
            className="doll-container"
        >
            <div className="doll-emoji">
                {EMOJI_EMOTIONS[emotion]}
            </div>
        </animated.div>
    );
}
