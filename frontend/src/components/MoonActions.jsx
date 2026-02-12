/**
 * MoonActions.js
 * 动作定义库：集中管理所有表情、动画和特效配置
 */
export const MOON_ACTIONS = {
    // === 基础状态 ===
    NEUTRAL: { emotion: 'neutral', animation: 'float-slow', duration: 0 },

    // === 头部交互 ===
    SHY: {
        id: 'shy',
        emotion: 'shy',
        animation: 'shake-gentle', // 轻微晃动
        duration: 1500,
        particles: 'heart' // 冒爱心
    },
    DIZZY: {
        id: 'dizzy',
        emotion: 'dizzy',
        animation: 'shake-dizzy', // 晕头转向
        duration: 2000
    },

    // === 嘴巴交互 ===
    SURPRISED: {
        id: 'surprised',
        emotion: 'surprised',
        animation: 'bounce-soft', // 软弹跳
        duration: 1000
    },
    LAUGHING: {
        id: 'laughing',
        emotion: 'happy',
        animation: 'tremble-happy', // 开心颤抖
        duration: 2000
    },

    // === 身体交互 ===
    POKE: {
        id: 'poke',
        emotion: 'neutral',
        animation: 'jelly-pudding', // 果冻Q弹
        duration: 600
    },
    SUPER_HAPPY: {
        id: 'super-happy',
        emotion: 'super-happy',
        animation: 'jump-joy', // 把此前的 jump 改为 jump-joy
        duration: 2500,
        particles: 'stars'
    }
};

export const CSS_ANIMATIONS = `
    /* --- 优化后的动画库 (更温柔、细腻) --- */

    /* 1. 缓慢悬浮 (默认) */
    @keyframes float-slow {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); } 
    }

    /* 2. 轻微害羞晃动 (减小幅度和频率) */
    @keyframes shake-gentle {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(3deg); }
        50% { transform: rotate(-3deg); }
        75% { transform: rotate(1deg); }
        100% { transform: rotate(0deg); }
    }

    /* 3. 果冻Q弹 (Poke) */
    @keyframes jelly-pudding {
        0% { transform: scale(1, 1); }
        30% { transform: scale(1.15, 0.85); } /* 压扁 */
        40% { transform: scale(0.9, 1.1); } /* 拉长 */
        50% { transform: scale(1.05, 0.95); }
        65% { transform: scale(0.98, 1.02); }
        75% { transform: scale(1.02, 0.98); }
        100% { transform: scale(1, 1); }
    }

    /* 4. 软弹跳 (Surprised) */
    @keyframes bounce-soft {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-15px); }
        60% { transform: translateY(-8px); }
    }

    /* 5. 快乐跳跃 (Super Happy) */
    @keyframes jump-joy {
        0% { transform: scale(1) translateY(0); }
        40% { transform: scale(1.1) translateY(-40px) rotate(5deg); }
        100% { transform: scale(1) translateY(0); }
    }
    
    /* 粒子飘动 */
    @keyframes particle-float {
        0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
        20% { opacity: 1; transform: scale(1); }
        100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
    }
`;
