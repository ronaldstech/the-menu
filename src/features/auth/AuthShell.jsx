import heroImg from '../../assets/hero.png'

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-mark__top" />
      <span className="brand-mark__base" />
    </div>
  )
}

function AuthShell({ children, mode, onModeChange }) {
  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="The Menu introduction">
        <div className="visual-topbar">
          <a className="brand" href="/" aria-label="The Menu home">
            <BrandMark />
            <span>the menu</span>
          </a>
          <span className="visual-kicker">Good food, well gathered.</span>
        </div>

        <div className="visual-content">
          <p className="eyebrow">A place for your next favorite</p>
          <h1>Make room for<br /><em>something good.</em></h1>
          <p className="visual-copy">
            Save the spots you love, discover what is next, and share a table with people who get it.
          </p>
          <div className="visual-art" aria-hidden="true">
            <div className="art-orbit art-orbit--one" />
            <div className="art-orbit art-orbit--two" />
            <img src={heroImg} alt="" />
            <span className="art-note">made for<br />the curious</span>
          </div>
        </div>

        <div className="visual-footer">
          <span>© 2026 The Menu</span>
          <span>Eat well. Stay curious.</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__inner">
          <div className="mobile-brand">
            <a className="brand" href="/" aria-label="The Menu home">
              <BrandMark />
              <span>the menu</span>
            </a>
          </div>
          <div className="auth-heading">
            <p className="eyebrow">Welcome in</p>
            <h2>{mode === 'login' ? 'Good to see you.' : 'Pull up a chair.'}</h2>
            <p>{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Create an account and start your list.'}</p>
          </div>
          <div className="auth-switch" role="tablist" aria-label="Account access">
            <button
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => onModeChange('login')}
              role="tab"
              aria-selected={mode === 'login'}
              type="button"
            >
              Log in
            </button>
            <button
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => onModeChange('signup')}
              role="tab"
              aria-selected={mode === 'signup'}
              type="button"
            >
              Sign up
            </button>
          </div>
          {children}
          <p className="auth-legal">
            By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </main>
  )
}

export default AuthShell
