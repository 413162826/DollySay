import { useState, useRef, useEffect } from 'react';
import { MOON_ACTIONS } from './MoonActions';

/**
 * useMoonBehavior Hook
 * 处理交互逻辑 + 休眠/唤醒机制
 */
export default function useMoonBehavior(onClickExternal) {
    const [currentAction, setCurrentAction] = useState(MOON_ACTIONS.NEUTRAL);
    const [clickCount, setClickCount] = useState(0);
    const [isAwake, setIsAwake] = useState(false); // 唤醒状态

    const clickTimeoutRef = useRef(null);
    const actionTimeoutRef = useRef(null);
    const wakeTimeoutRef = useRef(null); // 唤醒计时器

    // === 唤醒逻辑 ===
    const wakeUp = () => {
        setIsAwake(true);
        // 重置倒计时
        if (wakeTimeoutRef.current) clearTimeout(wakeTimeoutRef.current);
        // 10秒后自动休眠
        wakeTimeoutRef.current = setTimeout(() => {
            setIsAwake(false);
        }, 10000);
    };

    // 监听全局点击/输入以唤醒 (可选，如果要在组件外唤醒)
    useEffect(() => {
        const handleGlobalActivity = () => wakeUp();
        window.addEventListener('click', handleGlobalActivity);
        window.addEventListener('keydown', handleGlobalActivity);
        return () => {
            window.removeEventListener('click', handleGlobalActivity);
            window.removeEventListener('keydown', handleGlobalActivity);
        };
    }, []);


    // === 动作触发 ===
    const triggerAction = (actionKey) => {
        wakeUp(); // 触发动作时必然唤醒

        const action = MOON_ACTIONS[actionKey];
        if (!action) return;

        setCurrentAction(action);

        if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
        if (action.duration > 0) {
            actionTimeoutRef.current = setTimeout(() => {
                setCurrentAction(MOON_ACTIONS.NEUTRAL);
            }, action.duration);
        }
    };

    // === 连击逻辑 ===
    useEffect(() => {
        if (clickCount >= 5) {
            triggerAction('SUPER_HAPPY');
            setClickCount(0);
        } else if (clickCount > 0) {
            if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = setTimeout(() => setClickCount(0), 1000);
        }
    }, [clickCount]);

    // === 交互处理 ===
    const handleInteraction = (type, part) => {
        wakeUp(); // 交互即唤醒
        setClickCount(c => c + 1);
        if (onClickExternal) onClickExternal();

        if (type === 'click') {
            if (part === 'head') triggerAction('SHY');
            else if (part === 'mouth') triggerAction('SURPRISED');
            // Body click no longer triggers POKE, just wakes up and maybe happy
            else {
                // 可以选择给个微弱反馈，或者什么都不做(只唤醒)
                // triggerAction('NEUTRAL'); 
            }
        }
        else if (type === 'dblclick') {
            if (part === 'head') triggerAction('DIZZY');
            else if (part === 'mouth') triggerAction('LAUGHING');
        }
    };

    return {
        currentAction,
        triggerAction,
        handleInteraction,
        isAwake // 导出状态供组件使用
    };
}
