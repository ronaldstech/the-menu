import { useState } from 'react'

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.4 4.3 9.5 6-.4.7-1.2 1.8-2.4 2.9M6.2 6.2C3.9 7.8 2.7 10 2.5 11c1.1 1.7 4.3 6 9.5 6 1.1 0 2.1-.2 3-.5" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>
  )
}

function Field({ label, type = 'text', name, placeholder, value, onChange, autoComplete, inputMode, minLength, required = true }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <label className="field">
      <span>{label}</span>
      <span className="field__control">
        <input type={inputType} name={name} placeholder={placeholder} value={value} onChange={onChange} autoComplete={autoComplete} inputMode={inputMode} minLength={minLength} required={required} />
        {isPassword && (
          <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            <EyeIcon hidden={showPassword} />
          </button>
        )}
      </span>
    </label>
  )
}

function SocialButtons() {
  return (
    <div className="social-buttons">
      <button type="button" className="social-button"><strong>G</strong> Continue with Google</button>
      <button type="button" className="social-button"><strong>+</strong> Continue with Apple</button>
    </div>
  )
}

export function LoginForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  return (
    <form className="auth-form" onSubmit={(event) => onSubmit(event, form)}>
      <SocialButtons />
      <div className="divider"><span>or use your email</span></div>
      <Field label="Email address" name="email" type="email" placeholder="john@gmail.com" value={form.email} onChange={updateField} autoComplete="email" />
      <Field label="Password" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={updateField} autoComplete="current-password" />
      <div className="form-meta"><label className="checkbox-label"><input type="checkbox" /> <span>Remember me</span></label><a href="/forgot-password">Forgot password?</a></div>
      <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Log in'} <span aria-hidden="true">↗</span></button>
    </form>
  )
}

export function SignupForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '' })
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  return (
    <form className="auth-form" onSubmit={(event) => onSubmit(event, form)}>
      <SocialButtons />
      <div className="divider"><span>or use your email</span></div>
      <div className="field-row">
        <Field label="First name" name="first_name" placeholder="John" value={form.first_name} onChange={updateField} autoComplete="given-name" />
        <Field label="Last name" name="last_name" placeholder="Doe" value={form.last_name} onChange={updateField} autoComplete="family-name" />
      </div>
      <Field label="Email address" name="email" type="email" placeholder="john@gmail.com" value={form.email} onChange={updateField} autoComplete="email" />
      <Field label="Phone number" name="phone" type="tel" placeholder="0990000000" value={form.phone} onChange={updateField} autoComplete="tel" inputMode="tel" />
      <Field label="Create a password" name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={updateField} autoComplete="new-password" minLength="8" />
      <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'} <span aria-hidden="true">↗</span></button>
    </form>
  )
}
