import { useState } from 'react';
import Doll from './components/Doll';
import ChatBox from './components/ChatBox';
import './App.css';

function App() {
  const [emotion, setEmotion] = useState('neutral');

  const handleDollClick = () => {
    console.log('玩偶被点击了！');
  };

  return (
    <div className="app">
      <main className="app-main">
        <div className="doll-section">
          <Doll emotion={emotion} onClick={handleDollClick} />
          <h1 className="doll-title">小月 🌙</h1>
          <p className="doll-subtitle">你的24小时倾听者</p>
        </div>

        <div className="chat-section">
          <ChatBox onEmotionChange={setEmotion} />
        </div>
      </main>
    </div>
  );
}

export default App;
