export default function MessageBubble({ role, content }) {
    return (
        <div className={`message-bubble ${role}`}>
            <div className="bubble-content">
                {content}
            </div>
            <div className="bubble-tail"></div>
        </div>
    );
}
