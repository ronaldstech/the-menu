import { useState } from 'react'

function PhoneVerification({ email, phone, verifyRegistrationCode, onVerified, onBack, backLabel = 'Back to sign up' }) {
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const result = await verifyRegistrationCode(email, code)
      onVerified(result)
    } catch (verificationError) {
      setError(verificationError.message || 'That code was not accepted. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-verification-page">
      <div className="auth-verification-art" aria-hidden="true"><span>02</span><i /></div>
      <section className="auth-verification-content">
        <p className="eyebrow">Almost there</p>
        <h1>Check your<br /><em>phone.</em></h1>
        <p className="auth-verification-copy">We sent a verification code to <strong>{phone || 'your registered phone number'}</strong>.</p>
        <form className="auth-form auth-verification-form" onSubmit={handleSubmit}>
          <label className="field"><span>6-digit verification code</span><span className="field__control"><input className="otp-input" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" pattern="[0-9]{6}" placeholder="000000" autoComplete="one-time-code" autoFocus required /></span></label>
          <button className="submit-button" type="submit" disabled={isSubmitting || code.length !== 6}>{isSubmitting ? 'Verifying code...' : 'Verify my account'} <span aria-hidden="true">↗</span></button>
        </form>
        {error && <p className="auth-verification-error" role="alert">{error}</p>}
        <button className="auth-verification-back" type="button" onClick={onBack}>{backLabel}</button>
      </section>
    </main>
  )
}

export default PhoneVerification
