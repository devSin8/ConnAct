import { useEffect, useEffectEvent, useState } from 'react'
import Chat from './chat'
import AuthScreen from './components/AuthScreen'
import ChatEmptyState from './components/ChatEmptyState'
import Sidebar from './components/Sidebar'
import { supabase } from './supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activeUser, setActiveUser] = useState(null)

  const insertUser = useEffectEvent(async (u) => {
    await supabase.from('users').upsert({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name,
      avatar_url: u.user_metadata?.avatar_url
    })
  })

  const fetchUsers = useEffectEvent(async (myId) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .neq('id', myId)
      .order('created_at', { ascending: false })
    setUsers(data || [])
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) {
        await insertUser(u)
        await fetchUsers(u.id)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        insertUser(session.user)
        fetchUsers(session.user.id)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setActiveChat(null)
    setActiveUser(null)
  }

  // Create or open DM
  async function startChat(otherUserId) {
  try {
    // find existing DM (both users in same chat)
    const { data: existing, error: findError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id)

    if (findError) {
      console.error('Find chats error:', findError)
      return
    }

    let chatId = null

    if (existing && existing.length) {
      // check each chat if other user is also in it
      for (let c of existing) {
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', c.chat_id)

        const ids = participants?.map(p => p.user_id) || []

        if (ids.includes(user.id) && ids.includes(otherUserId)) {
          chatId = c.chat_id
          break
        }
      }
    }

    // If not found → create new chat
    if (!chatId) {
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          is_group: false,
          created_by: user.id
        })
        .select()
        .single()

      if (chatError || !chat) {
        console.error('Chat create error:', chatError)
        return
      }

      chatId = chat.id

      // add participants
      const { error: partError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: chatId, user_id: user.id },
          { chat_id: chatId, user_id: otherUserId }
        ])

      if (partError) {
        console.error('Participants insert error:', partError)
        return
      }
    }

    //Open chat
    setActiveChat(chatId)

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

  if (!user) {
    return <AuthScreen signInWithGoogle={signInWithGoogle} />
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        users={users}
        activeUser={activeUser}
        onSelectUser={async (u) => {
          setActiveUser(u)
          await startChat(u.id)
        }}
        signOut={signOut}
      />

      <main className="workspace-pane">
        {activeChat ? (
          <Chat
            chatId={activeChat}
            user={user}
            activeUser={activeUser}
            goBack={() => {
              setActiveChat(null)
              setActiveUser(null)
            }}
          />
        ) : (
          <ChatEmptyState />
        )}
      </main>
    </div>
  )
}

export default App
