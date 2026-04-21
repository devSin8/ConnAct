import { useEffect, useMemo, useRef, useState } from 'react'
import MessageBubble from './components/MessageBubble'
import { supabase } from './supabaseClient'

function getDisplayName(entry, fallback = 'User') {
  return entry?.name || entry?.email || fallback
}

function getAvatarInitial(entry) {
  return getDisplayName(entry).trim().charAt(0).toUpperCase()
}

export default function Chat({ chatId, user, goBack, activeUser }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => {
    supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        is_code,
        users (
          name,
          email,
          avatar_url
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error(error)
          return
        }

        console.log('Fetched messages:', data)

        setMessages(data || [])
      })

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Realtime message:', payload.new)

          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const chatTitle = useMemo(() => {
    const otherMessage = messages.find(m => m.sender_id !== user.id)

    return (
      getDisplayName(activeUser, '') ||
      getDisplayName(otherMessage?.users, '') ||
      'Direct message'
    )
  }, [activeUser, messages, user.id])

  const typingState = text.trim() ? 'typing...' : 'online'

  async function sendMessage() {
    if (!text.trim()) return

    await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: user.id,
      content: text,
      is_code: text.startsWith('```')
    })

    setText('')
  }

  return (
    <section className="chat-panel">
      <header className="chat-header">
        <div className="chat-header__identity">
          <button type="button" className="button button--ghost chat-header__back" onClick={goBack}>
            Back
          </button>
          <div className="avatar" aria-hidden="true">
            {getAvatarInitial(activeUser || { name: chatTitle })}
          </div>
          <div>
            <div className="chat-header__title-row">
              <h2 className="chat-header__title">{chatTitle}</h2>
              <span className="presence-dot" aria-hidden="true" />
            </div>
            <div
              className={`chat-header__status${text.trim() ? ' chat-header__status--typing' : ''}`}
            >
              {typingState}
            </div>
          </div>
        </div>
      </header>

      <div className="chat-messages" ref={messagesRef}>
        {messages.length ? (
          messages.map(m => {
            const isMe = m.sender_id === user.id
            const name = isMe
              ? getDisplayName({
                  name: user.user_metadata?.full_name,
                  email: user.email
                })
              : getDisplayName(m.users || activeUser)

            return <MessageBubble key={m.id} message={m} isMe={isMe} name={name} />
          })
        ) : (
          <div className="chat-empty-messages">
            Messages will appear here as soon as the current thread receives them.
          </div>
        )}
      </div>

      <div className="composer">
        <label className="sr-only" htmlFor="chat-message-input">
          Message input
        </label>
        <input
          id="chat-message-input"
          className="composer__field"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type message (``` for code)"
        />
        <button type="button" className="button button--primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </section>
  )
}