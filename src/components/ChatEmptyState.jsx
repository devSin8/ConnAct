export default function ChatEmptyState() {
  return (
    <div className="chat-empty">
      <div className="chat-empty__panel">
        <div className="chat-empty__meta">Chat Window</div>
        <h2 className="chat-empty__title">Pick a conversation to start messaging</h2>
        <p className="chat-empty__copy">
          The sidebar stays focused on people and chats, while this panel becomes the active thread
          once you open one.
        </p>
      </div>
    </div>
  )
}
