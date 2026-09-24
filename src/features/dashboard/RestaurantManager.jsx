import { useCallback, useEffect, useState } from 'react'

const emptyRestaurant = {
  name: '', slug: '', description: '', phone: '', email: '', address_line_1: '', address_line_2: '', city: '', state: '', postal_code: '', country: '',
}

function getItems(result) {
  if (Array.isArray(result)) return result
  if (!result || typeof result !== 'object') return []
  for (const key of ['restaurants', 'data', 'items', 'results']) {
    const value = result[key]
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') {
      const nestedItems = getItems(value)
      if (nestedItems.length) return nestedItems
    }
  }
  return []
}

function RestaurantManager({ token, listRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant }) {
  const [restaurants, setRestaurants] = useState([])
  const [form, setForm] = useState(emptyRestaurant)
  const [selectedId, setSelectedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadRestaurants = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await listRestaurants(token)
      setRestaurants(getItems(result))
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load restaurants.' })
    } finally {
      setIsLoading(false)
    }
  }, [listRestaurants, token])

  useEffect(() => {
    void Promise.resolve().then(loadRestaurants)
  }, [loadRestaurants])

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const openNew = () => { setSelectedId(null); setForm(emptyRestaurant); setStatus({ type: '', message: '' }); setIsFormOpen(true) }

  const openEdit = async (restaurant) => {
    setStatus({ type: '', message: '' })
    setSelectedId(restaurant.id)
    setIsFormOpen(true)
    try {
      const result = await getRestaurant(restaurant.id, token)
      setForm({ ...emptyRestaurant, ...(result?.restaurant || result?.data || result) })
    } catch (error) {
      setForm({ ...emptyRestaurant, ...restaurant })
      setStatus({ type: 'error', message: error.message || 'Could not load restaurant details.' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    try {
      const result = selectedId ? await updateRestaurant({ ...form, id: selectedId }, token) : await createRestaurant(form, token)
      setStatus({ type: 'success', message: result?.message || (selectedId ? 'Restaurant updated.' : 'Restaurant submitted for admin approval.') })
      setIsFormOpen(false)
      await loadRestaurants()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save restaurant.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (restaurant) => {
    if (!window.confirm(`Delete ${restaurant.name}?`)) return
    setStatus({ type: '', message: '' })
    try {
      const result = await deleteRestaurant(restaurant.id, token)
      setStatus({ type: 'success', message: result?.message || 'Restaurant deleted.' })
      await loadRestaurants()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not delete restaurant.' })
    }
  }

  return (
    <section className="restaurant-manager">
      <header className="manager-heading"><div><p className="dashboard-eyebrow">Restaurant management</p><h1>Restaurants.</h1><p className="dashboard-subtitle">Create and manage the places you operate.</p></div><button className="dark-action" type="button" onClick={openNew}>Add restaurant <span aria-hidden="true">+</span></button></header>
      {status.message && <p className={`restaurant-status restaurant-status--${status.type}`} role="status">{status.message}</p>}
      {isFormOpen && <form className="restaurant-form manager-form" onSubmit={handleSubmit}><div className="manager-form__heading"><h2>{selectedId ? 'Edit restaurant' : 'New restaurant'}</h2><button className="text-action" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button></div><div className="field-row"><label className="dashboard-field"><span>Restaurant name</span><input name="name" value={form.name} onChange={updateField} required /></label><label className="dashboard-field"><span>Slug</span><input name="slug" value={form.slug} onChange={updateField} required /></label></div><label className="dashboard-field"><span>Description</span><textarea name="description" value={form.description} onChange={updateField} rows="3" required /></label><div className="field-row"><label className="dashboard-field"><span>Email</span><input name="email" type="email" value={form.email} onChange={updateField} required /></label><label className="dashboard-field"><span>Phone</span><input name="phone" value={form.phone} onChange={updateField} required /></label></div><div className="field-row"><label className="dashboard-field"><span>Address line 1</span><input name="address_line_1" value={form.address_line_1} onChange={updateField} required /></label><label className="dashboard-field"><span>Address line 2</span><input name="address_line_2" value={form.address_line_2} onChange={updateField} /></label></div><div className="field-row field-row--three"><label className="dashboard-field"><span>City</span><input name="city" value={form.city} onChange={updateField} required /></label><label className="dashboard-field"><span>State</span><input name="state" value={form.state} onChange={updateField} required /></label><label className="dashboard-field"><span>Postal code</span><input name="postal_code" value={form.postal_code} onChange={updateField} required /></label></div><label className="dashboard-field"><span>Country</span><input name="country" value={form.country} onChange={updateField} required /></label><button className="dark-action restaurant-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : selectedId ? 'Update restaurant' : 'Create restaurant'} <span aria-hidden="true">↗</span></button></form>}
      {isLoading ? <p className="dashboard-subtitle">Loading restaurants...</p> : restaurants.length === 0 ? <div className="owner-empty-state"><h2>No restaurants yet</h2><p>Create your first restaurant to start managing your menu and service.</p><button className="dark-action" type="button" onClick={openNew}>Create restaurant <span aria-hidden="true">+</span></button></div> : <div className="restaurant-list">{restaurants.map((restaurant) => <article className="restaurant-list-item" key={restaurant.id}><div><p className="dashboard-eyebrow">{restaurant.status || 'Restaurant'}</p><h2>{restaurant.name}</h2><p>{restaurant.city || 'Location not available'}{restaurant.description ? ` · ${restaurant.description}` : ''}</p></div><div className="restaurant-list-actions"><button className="text-action" type="button" onClick={() => openEdit(restaurant)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(restaurant)}>Delete</button></div></article>)}</div>}
    </section>
  )
}

export default RestaurantManager
