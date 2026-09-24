import { useState } from 'react'

const initialForm = {
  name: '',
  slug: '',
  description: '',
  phone: '',
  email: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
}

function RestaurantForm({ token, onSubmitted, createRestaurant }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsSubmitting(true)
    try {
      const result = await createRestaurant(form, token)
      setStatus({ type: 'success', message: result?.message || 'Restaurant submitted for admin approval.' })
      setForm(initialForm)
      onSubmitted?.(result)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'We could not submit your restaurant.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="restaurant-view">
      <div className="restaurant-intro">
        <p className="dashboard-eyebrow">For restaurant owners</p>
        <h1>Put your place<br /><em>on the menu.</em></h1>
        <p className="dashboard-subtitle">Tell us about your restaurant. Our team will review your details before it goes live.</p>
      </div>
      <form className="restaurant-form" onSubmit={handleSubmit}>
        {status.message && <p className={`restaurant-status restaurant-status--${status.type}`} role="status">{status.message}</p>}
        <div className="field-row">
          <label className="dashboard-field"><span>Restaurant name</span><input name="name" value={form.name} onChange={updateField} placeholder="The Garden Restaurant" required /></label>
          <label className="dashboard-field"><span>Slug</span><input name="slug" value={form.slug} onChange={updateField} placeholder="the-garden-restaurant" required /></label>
        </div>
        <label className="dashboard-field"><span>Description</span><textarea name="description" value={form.description} onChange={updateField} placeholder="What makes your restaurant special?" rows="4" required /></label>
        <div className="field-row">
          <label className="dashboard-field"><span>Restaurant email</span><input name="email" type="email" value={form.email} onChange={updateField} placeholder="contact@garden.com" required /></label>
          <label className="dashboard-field"><span>Restaurant phone</span><input name="phone" type="tel" value={form.phone} onChange={updateField} placeholder="5551234567" inputMode="tel" required /></label>
        </div>
        <div className="field-row">
          <label className="dashboard-field"><span>Address line 1</span><input name="address_line_1" value={form.address_line_1} onChange={updateField} placeholder="123 Main Street" required /></label>
          <label className="dashboard-field"><span>Address line 2 <small>(optional)</small></span><input name="address_line_2" value={form.address_line_2} onChange={updateField} placeholder="Suite 2" /></label>
        </div>
        <div className="field-row field-row--three">
          <label className="dashboard-field"><span>City</span><input name="city" value={form.city} onChange={updateField} placeholder="New York" required /></label>
          <label className="dashboard-field"><span>State</span><input name="state" value={form.state} onChange={updateField} placeholder="NY" required /></label>
          <label className="dashboard-field"><span>Postal code</span><input name="postal_code" value={form.postal_code} onChange={updateField} placeholder="10001" required /></label>
        </div>
        <label className="dashboard-field"><span>Country</span><input name="country" value={form.country} onChange={updateField} placeholder="USA" required /></label>
        <button className="dark-action restaurant-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting for review...' : 'Submit restaurant'} <span aria-hidden="true">↗</span></button>
      </form>
    </section>
  )
}

export default RestaurantForm
