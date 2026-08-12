import { Link } from 'react-router-dom';
import './EditorialAuthScreen.css';

const COPY = {
  writer: {
    roleLabel: 'Writer',
    login: {
      title: 'Welcome back, Writer',
      subtitle: 'Continue writing, publishing, and growing your audience.',
      mobileSubtitle: 'Continue writing and publishing.',
      submit: 'Sign in as Writer',
      switchPrefix: 'New to Bloggad?',
      switchLabel: 'Create a Writer account',
      asideBadge: 'For people with something worth saying',
      asideTitleLine1: 'Write with clarity.',
      asideTitleLine2: 'Publish with purpose.',
      asideBody:
        'A focused place to turn drafts into thoughtful stories, build Pages around your ideas, and grow a real readership.',
      asideCardTitle: 'A better publishing habit',
      asideQuote:
        'Start with one useful idea. Shape it carefully. Publish when it is ready.',
      asideFoot: 'Your work is waiting.',
    },
    register: {
      title: 'Create your Writer account',
      subtitle: 'Start publishing thoughtful work and building your audience.',
      mobileSubtitle: 'Publish thoughtful work and build your audience.',
      submit: 'Create Writer account',
      switchPrefix: 'Already have an account?',
      switchLabel: 'Sign in',
      asideBadge: 'For people with something worth saying',
      asideTitleLine1: 'Write with clarity.',
      asideTitleLine2: 'Publish with purpose.',
      asideBody:
        'A focused place to turn drafts into thoughtful stories, build Pages around your ideas, and grow a real readership.',
      asideCardTitle: 'A better publishing habit',
      asideQuote:
        'Start with one useful idea. Shape it carefully. Publish when it is ready.',
      asideFoot: 'Your space starts here.',
    },
  },
  reader: {
    roleLabel: 'Reader',
    login: {
      title: 'Welcome back, Reader',
      subtitle:
        'Continue reading, saving, and following ideas that matter to you.',
      mobileSubtitle: 'Continue reading and following ideas you care about.',
      submit: 'Sign in as Reader',
      switchPrefix: 'New to Bloggad?',
      switchLabel: 'Create a Reader account',
      asideBadge: 'For people who want something worth reading',
      asideTitleLine1: 'Read ideas worth',
      asideTitleLine2: 'your time.',
      asideBody:
        'Follow Writers and topics you care about, save what matters, and build a feed that gets better the more you read.',
      asideCardTitle: 'A calmer reading habit',
      asideQuote:
        'Spend less time scrolling past noise and more time with ideas you want to remember.',
      asideFoot: 'Your work is waiting.',
    },
    register: {
      title: 'Create your Reader account',
      subtitle:
        'Build a reading space around the ideas and topics you care about.',
      mobileSubtitle: 'Create a reading space around ideas you care about.',
      submit: 'Create Reader account',
      switchPrefix: 'Already have an account?',
      switchLabel: 'Sign in',
      asideBadge: 'For people who want something worth reading',
      asideTitleLine1: 'Read ideas worth',
      asideTitleLine2: 'your time.',
      asideBody:
        'Follow Writers and topics you care about, save what matters, and build a feed that gets better the more you read.',
      asideCardTitle: 'A calmer reading habit',
      asideQuote:
        'Spend less time scrolling past noise and more time with ideas you want to remember.',
      asideFoot: 'Your space starts here.',
    },
  },
};

export default function EditorialAuthScreen({
  role,
  mode,
  form,
  onChange,
  onSubmit,
  onRoleChange,
  loading = false,
  error = '',
  success = '',
  switchTo,
  storefrontNote = '',
  passwordVisible = false,
  onTogglePassword,
}) {
  const roleCopy = COPY[role] || COPY.writer;
  const copy = roleCopy[mode] || roleCopy.login;
  const isRegister = mode === 'register';

  return (
    <main className={`editorial-auth editorial-auth-${role}`}>
      <section className="editorial-auth-form-panel">
        <div className="editorial-auth-form-shell">
          <div className="editorial-auth-brand" aria-label="Bloggad">
            <span className="editorial-auth-brand-mark" aria-hidden="true">
              <span />
            </span>
            <strong>Bloggad</strong>
          </div>

          <div
            className="editorial-auth-role-toggle"
            role="tablist"
            aria-label="Choose account type"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === 'writer'}
              className={
                role === 'writer'
                  ? 'editorial-auth-role-option is-active'
                  : 'editorial-auth-role-option'
              }
              onClick={() => onRoleChange?.('writer')}
            >
              Writer
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === 'reader'}
              className={
                role === 'reader'
                  ? 'editorial-auth-role-option is-active'
                  : 'editorial-auth-role-option'
              }
              onClick={() => onRoleChange?.('reader')}
            >
              Reader
            </button>
          </div>

          <div className="editorial-auth-heading">
            <h1>{copy.title}</h1>
            <p className="editorial-auth-subtitle editorial-auth-subtitle-desktop">
              {copy.subtitle}
            </p>
            <p className="editorial-auth-subtitle editorial-auth-subtitle-mobile">
              {copy.mobileSubtitle}
            </p>
          </div>

          {storefrontNote ? (
            <div className="editorial-auth-context-note">{storefrontNote}</div>
          ) : null}

          <button
            type="button"
            className="editorial-auth-google"
            disabled
            title="Google sign-in is not currently enabled."
          >
            Continue with Google
          </button>

          <div className="editorial-auth-divider" aria-hidden="true">
            <span />
            <small>or</small>
            <span />
          </div>

          {error ? (
            <div className="editorial-auth-alert editorial-auth-alert-error" role="alert">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="editorial-auth-alert editorial-auth-alert-success" role="status">
              {success}
            </div>
          ) : null}

          <form className="editorial-auth-form" onSubmit={onSubmit}>
            {isRegister ? (
              <label className="editorial-auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name || ''}
                  onChange={onChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </label>
            ) : null}

            <label className="editorial-auth-field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                value={form.email || ''}
                onChange={onChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="editorial-auth-field">
              <span>Password</span>
              <div className="editorial-auth-password-wrap">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  value={form.password || ''}
                  onChange={onChange}
                  placeholder={
                    isRegister ? 'Create a secure password' : 'Enter your password'
                  }
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  minLength={isRegister ? 8 : undefined}
                  required
                />
                <button
                  type="button"
                  className="editorial-auth-password-toggle"
                  onClick={onTogglePassword}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {isRegister ? (
              <p className="editorial-auth-helper">
                <span className="editorial-auth-helper-desktop">
                  Use at least 8 characters with a mix of letters and numbers.
                </span>
                <span className="editorial-auth-helper-mobile">
                  Use at least 8 characters.
                </span>
              </p>
            ) : (
              <div className="editorial-auth-forgot">Forgot password?</div>
            )}

            <button
              type="submit"
              className="editorial-auth-submit"
              disabled={loading}
            >
              {loading
                ? isRegister
                  ? 'Creating account...'
                  : 'Signing in...'
                : copy.submit}
            </button>
          </form>

          <p className="editorial-auth-switch">
            <span>{copy.switchPrefix} </span>
            <Link to={switchTo}>{copy.switchLabel}</Link>
          </p>

          {isRegister ? (
            <p className="editorial-auth-legal">
              By continuing, you agree to Bloggad Terms and Privacy Policy.
            </p>
          ) : null}
        </div>
      </section>

      <aside className="editorial-auth-story-panel" aria-hidden="true">
        <div className="editorial-auth-story-shell">
          <div className="editorial-auth-story-badge">{copy.asideBadge}</div>

          <h2>
            <span>{copy.asideTitleLine1}</span>
            <span>{copy.asideTitleLine2}</span>
          </h2>

          <p className="editorial-auth-story-body">{copy.asideBody}</p>

          <div className="editorial-auth-story-card">
            <strong>{copy.asideCardTitle}</strong>
            <blockquote>&ldquo;{copy.asideQuote}&rdquo;</blockquote>
            <small>{copy.asideFoot}</small>
          </div>
        </div>
      </aside>
    </main>
  );
}