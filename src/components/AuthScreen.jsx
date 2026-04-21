function getInitial(value) {
  return value?.trim()?.charAt(0)?.toUpperCase() || 'S'
}

export default function AuthScreen({ signInWithGoogle }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark" aria-hidden="true" />
          <div>
            <div className="sidebar__eyebrow">Steel Frost</div>
            <h1 className="auth-card__title">Realtime chat with a colder edge</h1>
          </div>
        </div>

        <p className="auth-card__copy">
          Sign in to jump into the existing Supabase-powered chat flow with the refreshed UI layer.
        </p>

        <div className="sidebar__profile sidebar__card">
          <div className="avatar" aria-hidden="true">
            {getInitial('Steel Frost')}
          </div>
          <div>
            <p className="sidebar__profile-name">Secure Google Auth</p>
            <p className="sidebar__profile-email">Existing auth flow preserved</p>
          </div>
        </div>

        <div className="auth-card__actions">
          <button type="button" className="button button--primary" onClick={signInWithGoogle}>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  )
}
