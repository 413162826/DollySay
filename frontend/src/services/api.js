import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 生成或获取sessionId
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'guest-' + crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// 发送消息
export const sendMessage = async (message) => {
  const response = await api.post('/chat', {
    message,
    sessionId: getSessionId(),
    isGuest: !localStorage.getItem('token')  // V1都是true
  });
  return response.data;
};

// 健康检查
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
