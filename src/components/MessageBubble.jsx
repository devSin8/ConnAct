const reactions = ['\u{1F44D}', '\u{1F525}', '\u{2764}\u{FE0F}']

function formatMessageTime(value) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleReactionClick(event) {
  event.preventDefault()
}

export default function MessageBubble({ message, isMe, name }) {
  return (
    <div className={`message-row ${isMe ? 'message-row--own' : 'message-row--other'}`}>
      <article className={`message-bubble ${isMe ? 'message-bubble--own' : 'message-bubble--other'}`}>
        <div className="message-bubble__meta">
          <span className="message-bubble__name">{name}</span>
          <span className="message-bubble__timestamp">{formatMessageTime(message.created_at)}</span>
        </div>

        <div className="message-bubble__content">
          {message.is_code ? <pre>{message.content}</pre> : <div>{message.content}</div>}
        </div>

        <div className="message-bubble__reactions" aria-label="Reaction placeholders">
          {reactions.map(reaction => (
            <button
              key={reaction}
              type="button"
              className="reaction-button"
              onClick={handleReactionClick}
              aria-label={`Add ${reaction} reaction`}
            >
              {reaction}
            </button>
          ))}
        </div>
      </article>
    </div>
  )
}
