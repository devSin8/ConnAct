import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Chat({ chatId, user, goBack }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
  fetchMessages()

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

  async function fetchMessages() {
  const { data, error } = await supabase
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

  if (error) {
    console.error(error)
    return
  }

  console.log('Fetched messages:', data)

  setMessages(data || [])
}
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
    <div style={{ padding: 20 }}>
      <button onClick={goBack}>⬅ Back</button>

      <h3>Chat</h3>

      <div style={{ border: '1px solid gray', height: 300, overflowY: 'auto', padding: 10 }}>
        {messages.map(m => {
  const isMe = m.sender_id === user.id
  const name = m.users?.name || m.users?.email || 'User'

  return (
    <div
      key={m.id}
      style={{
        display: 'flex',
        justifyContent: isMe ? 'flex-end' : 'flex-start',
        marginBottom: '10px'
      }}
    >
      <div
        style={{
          maxWidth: '60%',
          padding: '10px',
          borderRadius: '10px',
          background: isMe ? '#4caf50' : '#333',
          color: 'white'
        }}
      >
        {!isMe && (
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            {name}
          </div>
        )}

        {m.is_code ? (
          <pre style={{ margin: 0 }}>{m.content}</pre>
        ) : (
          <div>{m.content}</div>
        )}
      </div>
    </div>
  )
})}
      </div>

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type message (``` for code)"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}