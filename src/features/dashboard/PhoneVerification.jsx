import { useEffect, useState } from 'react'

function PhoneVerification({ phone, token, sendPhoneOtp, verifyPhoneOtp, onVerified }) {
  const [step, setStep] = useState('intro')
  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const maskedPhone = phone ? `${phone.slice(0, 3)}••••${phone.slice(-2)}` : 'your phone number'

  useEffect(() => {
    if (secondsLeft <= 0) return undefined
    const timer = window.setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const requestOtp = async () => {
    setError('')
    setMessage('')
    if (!phone) {
      setError('Add a phone number to your profile before requesting a verification code.')
      return
    }
    setIsSubmitting(true)
    try {
      await sendPhoneOtp(phone, token)
      setStep('otp')
      setSecondsLeft(30)
      setMessage(`We sent a 6-digit code to ${maskedPhone}.`)
    } catch (requestError) {
      setError(requestError.message || 'We could not send your code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await verifyPhoneOtp(phone, otp, token)
      setStep('verified')
      onVerified?.()
    } catch (verifyError) {
      setError(verifyError.message || 'That code was not accepted. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOtpStep = step === 'otp'

  return (
    <section className={`phone-verification phone-verification--${step}`}>
      <div className="verification-art" aria-hidden="true"><span>{isOtpStep ? '02' : '01'}</span><div className="verification-ring" /></div>
      <div className="verification-copy">
        <p className="dashboard-eyebrow">Owner access</p>
        {step === 'verified' ? (
          <><h1>You are<br /><em>verified.</em></h1><p className="dashboard-subtitle">Your phone number is confirmed. You can now submit a restaurant for admin review.</p></>
        ) : step === 'otp' ? (
          <><h1>Check your<br /><em>phone.</em></h1><p className="dashboard-subtitle">Enter the code we sent to {maskedPhone}.</p><form className="verification-form" onSubmit={verifyOtp}><label className="dashboard-field"><span>6-digit verification code</span><input className="otp-input" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" pattern="[0-9]{6}" placeholder="000000" autoComplete="one-time-code" autoFocus required /></label><button className="dark-action verification-submit" type="submit" disabled={isSubmitting || otp.length !== 6}>{isSubmitting ? 'Checking code...' : 'Verify phone'} <span aria-hidden="true">↗</span></button></form><div className="verification-actions"><button className="resend-button" type="button" onClick={requestOtp} disabled={isSubmitting || secondsLeft > 0}>{secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}</button><button className="back-button" type="button" onClick={() => { setStep('intro'); setOtp(''); setError(''); setMessage('') }}>Use a different number</button></div></>
        ) : (
          <><h1>Open your<br /><em>own door.</em></h1><p className="dashboard-subtitle">Verify your phone number to become a restaurant owner and submit your place for admin approval.</p><button className="dark-action verification-submit" type="button" onClick={requestOtp} disabled={isSubmitting}>{isSubmitting ? 'Sending code...' : 'Send me a code'} <span aria-hidden="true">↗</span></button></>
        )}
        {message && <p className="verification-message" role="status">{message}</p>}
        {error && <p className="verification-error" role="alert">{error}</p>}
      </div>
    </section>
  )
}

export default PhoneVerification
