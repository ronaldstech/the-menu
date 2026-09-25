import { useCallback, useEffect, useState } from 'react'

const emptyStaff = { restaurant_id: '', user_id: '', role: 'attendant' }
const staffRoles = ['manager', 'attendant']
const roleIdToName = { 1: 'admin', 2: 'owner', 3: 'manager', 4: 'attendant', 5: 'customer' }

function getItems(result) {
  if (Array.isArray(result)) return result
  if (!result || typeof result !== 'object') return []
  for (const key of ['staff', 'restaurants', 'data', 'items', 'results']) {
    if (Array.isArray(result[key])) return result[key]
    if (result[key] && typeof result[key] === 'object') {
      const nested = getItems(result[key])
      if (nested.length) return nested
    }
  }
  return []
}

function roleName(member) {
  const raw = member?.role ?? (Array.isArray(member?.roles) ? member.roles[0] : member?.roles)
  if (typeof raw === 'number') return roleIdToName[raw] || 'attendant'
  return String(raw || 'attendant')
}

function StaffManager({ token, listRestaurants, listStaff, getStaff, createStaff, updateStaff, deleteStaff }) {
  const [restaurants, setRestaurants] = useState([])
  const [staff, setStaff] = useState([])
  const [restaurantId, setRestaurantId] = useState('')
  const [form, setForm] = useState(emptyStaff)
  const [selectedId, setSelectedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadStaff = useCallback(async (id) => {
    if (!id) {
      setStaff([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const result = await listStaff(id, token)
      setStaff(getItems(result))
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load staff.' })
    } finally {
      setIsLoading(false)
    }
  }, [listStaff, token])

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const result = await listRestaurants(token)
        const items = getItems(result)
        setRestaurants(items)
        const firstRestaurantId = items[0]?.id ? String(items[0].id) : ''
        setRestaurantId(firstRestaurantId)
        await loadStaff(firstRestaurantId)
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Could not load restaurants.' })
        setIsLoading(false)
      }
    })
  }, [listRestaurants, loadStaff, token])

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const selectRestaurant = (event) => {
    const nextRestaurantId = event.target.value
    setRestaurantId(nextRestaurantId)
    void loadStaff(nextRestaurantId)
  }

  const openNew = () => {
    setSelectedId(null)
    setForm({ ...emptyStaff, restaurant_id: restaurantId })
    setStatus({ type: '', message: '' })
    setIsFormOpen(true)
  }

  const openEdit = async (member) => {
    setStatus({ type: '', message: '' })
    setSelectedId(member.id)
    setIsFormOpen(true)
    let detail = { ...member, role: roleName(member) }
    try {
      const result = await getStaff(member.id, token)
      const full = result?.staff || result?.data || result
      if (full && typeof full === 'object') detail = { ...full, role: roleName(full) }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load staff details.' })
    }
    if (!staffRoles.includes(detail.role)) detail.role = 'attendant'
    setForm({ ...emptyStaff, user_id: String(member.id || ''), role: detail.role })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    try {
      const payload = { role: form.role, restaurant_id: Number(restaurantId || form.restaurant_id) }
      if (selectedId) {
        Object.assign(payload, { id: selectedId })
      } else {
        payload.user_id = Number(form.user_id)
      }
      const result = selectedId ? await updateStaff(payload, token) : await createStaff(payload, token)
      setStatus({ type: 'success', message: result?.message || (selectedId ? 'Role updated.' : 'Staff member added.') })
      setIsFormOpen(false)
      await loadStaff(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save staff member.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove ${member.first_name} ${member.last_name} from staff?`)) return
    setStatus({ type: '', message: '' })
    try {
      const result = await deleteStaff(member.id, token)
      setStatus({ type: 'success', message: result?.message || 'Staff member removed.' })
      await loadStaff(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not remove staff member.' })
    }
  }

  return (
    <section className="staff-manager">
      <header className="manager-heading"><div><p className="dashboard-eyebrow">Restaurant management</p><h1>Staff.</h1><p className="dashboard-subtitle">Invite the people who run the floor.</p></div><button className="dark-action" type="button" onClick={openNew} disabled={!restaurantId}>Add staff member <span aria-hidden="true">+</span></button></header>
      {status.message && <p className={`restaurant-status restaurant-status--${status.type}`} role="status">{status.message}</p>}
      <label className="restaurant-selector"><span>Restaurant</span><select value={restaurantId} onChange={selectRestaurant} disabled={isLoading}><option value="">Select a restaurant</option>{restaurants.map((restaurant) => <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>)}</select></label>
      {isFormOpen && <form className="restaurant-form manager-form" onSubmit={handleSubmit}><div className="manager-form__heading"><h2>{selectedId ? 'Edit staff member' : 'Add staff member'}</h2><button className="text-action" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button></div><label className="dashboard-field"><span>Role</span><select name="role" value={form.role} onChange={updateField}>{staffRoles.map((role) => <option value={role} key={role}>{role}</option>)}</select></label>{(selectedId ? <p className="staff-form-note">Editing role for <strong>{staff.find((member) => String(member.id) === String(selectedId))?.first_name || 'this staff member'}</strong>. User ID cannot be changed.</p> : <label className="dashboard-field"><span>User ID</span><input name="user_id" type="number" min="1" value={form.user_id} onChange={updateField} placeholder="e.g. 14" required /><small>The person must already have an account. You can find their User ID in their profile.</small></label>)}<button className="dark-action restaurant-submit" type="submit" disabled={isSubmitting || (!selectedId && !form.user_id)}>{isSubmitting ? 'Saving...' : (selectedId ? 'Save changes' : 'Add staff member')}</button></form>}
      {isLoading ? <p className="dashboard-subtitle">Loading staff...</p> : staff.length === 0 ? <div className="owner-empty-state"><h2>No staff yet</h2><p>Add your first staff member. They need an existing account — link them with their User ID.</p><button className="dark-action" type="button" onClick={openNew} disabled={!restaurantId}>Add staff member <span aria-hidden="true">+</span></button></div> : <div className="restaurant-list">{staff.map((member) => <article className="restaurant-list-item" key={member.id}><div><p className="dashboard-eyebrow">User ID {member.id}</p><h2>{member.first_name} {member.last_name}</h2><p>{member.email || 'No email'}{member.phone ? ` · ${member.phone}` : ''}</p></div><div className="restaurant-list-actions"><span className="staff-role">{roleName(member)}</span><button className="text-action" type="button" onClick={() => openEdit(member)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(member)}>Remove</button></div></article>)}</div>}
    </section>
  )
}

export default StaffManager