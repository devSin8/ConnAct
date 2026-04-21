function getDisplayName(entry) {
  return entry?.name || entry?.email || 'User'
}

function getInitial(entry) {
  return getDisplayName(entry).trim().charAt(0).toUpperCase()
}

export default function Sidebar({ user, users, activeUser, onSelectUser, signOut }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark" aria-hidden="true" />
        <div>
          <div className="sidebar__eyebrow">Steel Frost</div>
          <h2 className="sidebar__title">Conversations</h2>
          <p className="sidebar__subtitle">Modernized UI, same chat and realtime behavior.</p>
        </div>
      </div>

      <section className="sidebar__card">
        <div className="sidebar__profile">
          <div className="avatar" aria-hidden="true">
            {getInitial(user)}
          </div>
          <div>
            <p className="sidebar__profile-name">{getDisplayName(user)}</p>
            <p className="sidebar__profile-email">{user.email}</p>
          </div>
        </div>

        <div className="sidebar__actions">
          <button type="button" className="button button--ghost" onClick={signOut}>
            Logout
          </button>
        </div>
      </section>

      <section className="sidebar__section">
        <div className="sidebar__section-header">
          <div>
            <div className="sidebar__eyebrow">Users / Chats</div>
            <p className="sidebar__meta">{users.length} available</p>
          </div>
        </div>

        <div className="sidebar__list">
          {users.map(u => (
            <button
              key={u.id}
              type="button"
              className={`user-card${activeUser?.id === u.id ? ' user-card--active' : ''}`}
              onClick={() => onSelectUser(u)}
            >
              <div className="user-card__top">
                <div className="user-card__identity">
                  <div className="avatar" aria-hidden="true">
                    {getInitial(u)}
                  </div>
                  <div>
                    <p className="user-card__name">{getDisplayName(u)}</p>
                    <p className="user-card__email">{u.email}</p>
                  </div>
                </div>
                <span className="presence-dot" aria-label="Online user" title="Online user" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}
