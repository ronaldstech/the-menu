import { useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'

const emptyTable = { name: '', table_number: '', capacity: '4', is_active: true }
const isActive = (value) => value === true || value === 1 || value === '1' || value === 'true'

function getItems(result) {
  if (Array.isArray(result)) return result
  if (!result || typeof result !== 'object') return []
  for (const key of ['tables', 'restaurants', 'items', 'data', 'results']) {
    if (Array.isArray(result[key])) return result[key]
    if (result[key] && typeof result[key] === 'object') {
      const nested = getItems(result[key])
      if (nested.length) return nested
    }
  }
  return []
}

function qrPayload(token) {
  const publicMenuUrl = import.meta.env.VITE_PUBLIC_MENU_URL || window.location.origin
  const destination = new URL(publicMenuUrl, window.location.origin)
  destination.searchParams.set('token', token)
  return destination.toString()
}

function TableQrCode({ table }) {
  const [image, setImage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    setImage('')
    setError('')
    QRCode.toDataURL(qrPayload(table.qr_token), {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 240,
      color: { dark: '#19221d', light: '#fffef9' },
    }).then((dataUrl) => {
      if (isCurrent) setImage(dataUrl)
    }).catch(() => {
      if (isCurrent) setError('Could not render this QR code.')
    })
    return () => { isCurrent = false }
  }, [table.qr_token])

  if (error) return <p className="qr-error" role="status">{error}</p>
  return <div className="table-qr-code">
    {image ? <img src={image} alt={`QR code for table ${table.table_number}`} /> : <span>Preparing QR code…</span>}
    {image && <a className="text-action" href={image} download={`table-${table.table_number}-qr.png`}>Download QR</a>}
  </div>
}

function TablesManager({ token, listRestaurants, listTables, getTable, createTable, updateTable, deleteTable }) {
  const [restaurants, setRestaurants] = useState([])
  const [tables, setTables] = useState([])
  const [restaurantId, setRestaurantId] = useState('')
  const [form, setForm] = useState(emptyTable)
  const [selectedId, setSelectedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadTables = useCallback(async (id) => {
    if (!id) { setTables([]); setIsLoading(false); return }
    setIsLoading(true)
    try {
      const result = await listTables(id, token)
      setTables(getItems(result))
    } catch (error) {
      setTables([])
      setStatus({ type: 'error', message: error.message || 'Could not load tables.' })
    } finally {
      setIsLoading(false)
    }
  }, [listTables, token])

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const result = await listRestaurants(token)
        const availableRestaurants = getItems(result)
        setRestaurants(availableRestaurants)
        const firstId = availableRestaurants[0]?.id ? String(availableRestaurants[0].id) : ''
        setRestaurantId(firstId)
        await loadTables(firstId)
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Could not load restaurants.' })
        setIsLoading(false)
      }
    })
  }, [listRestaurants, loadTables, token])

  const openNew = () => {
    setSelectedId(null)
    setForm(emptyTable)
    setStatus({ type: '', message: '' })
    setIsFormOpen(true)
  }

  const openEdit = async (table) => {
    setSelectedId(table.id)
    setForm({ ...emptyTable, ...table, capacity: String(table.capacity ?? 4), is_active: isActive(table.is_active) })
    setStatus({ type: '', message: '' })
    setIsFormOpen(true)
    try {
      const result = await getTable(table.id, token)
      const loadedTable = result?.table || result?.data || result
      setForm({ ...emptyTable, ...loadedTable, capacity: String(loadedTable.capacity ?? 4), is_active: isActive(loadedTable.is_active) })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load table details.' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    const payload = {
      restaurant_id: Number(restaurantId),
      name: form.name,
      table_number: form.table_number,
      capacity: Number(form.capacity),
    }
    try {
      const result = selectedId
        ? await updateTable({ ...payload, is_active: isActive(form.is_active), id: selectedId }, token)
        : await createTable(payload, token)
      setStatus({ type: 'success', message: result?.message || (selectedId ? 'Table updated.' : 'Table created.') })
      setIsFormOpen(false)
      await loadTables(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save table.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (table) => {
    if (!window.confirm(`Delete table ${table.table_number}?`)) return
    setStatus({ type: '', message: '' })
    try {
      const result = await deleteTable(table.id, token)
      setStatus({ type: 'success', message: result?.message || 'Table deleted.' })
      await loadTables(restaurantId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not delete table.' })
    }
  }

  const selectRestaurant = (event) => {
    const id = event.target.value
    setRestaurantId(id)
    setIsFormOpen(false)
    void loadTables(id)
  }

  return <section className="tables-manager">
    <header className="manager-heading"><div><p className="dashboard-eyebrow">Restaurant management</p><h1>Tables &amp; QR.</h1><p className="dashboard-subtitle">Manage table details and download a QR code for each table.</p></div><button className="dark-action" type="button" onClick={openNew} disabled={!restaurantId}>Add table <span aria-hidden="true">+</span></button></header>
    {status.message && <p className={`restaurant-status restaurant-status--${status.type}`} role="status">{status.message}</p>}
    <label className="restaurant-selector"><span>Restaurant</span><select value={restaurantId} onChange={selectRestaurant} disabled={isLoading}><option value="">Select a restaurant</option>{restaurants.map((restaurant) => <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>)}</select></label>
    {isFormOpen && <form className="restaurant-form manager-form" onSubmit={handleSubmit}>
      <div className="manager-form__heading"><h2>{selectedId ? 'Edit table' : 'New table'}</h2><button className="text-action" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button></div>
      <div className="field-row"><label className="dashboard-field"><span>Table name</span><input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Patio table" required /></label><label className="dashboard-field"><span>Table number</span><input name="table_number" value={form.table_number} onChange={(event) => setForm({ ...form, table_number: event.target.value })} placeholder="1" required /></label></div>
      <label className="dashboard-field"><span>Capacity</span><input name="capacity" type="number" min="1" max="255" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} required /></label>
      {selectedId && <label className="dashboard-field category-toggle"><span>Active</span><input name="is_active" type="checkbox" checked={isActive(form.is_active)} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /></label>}
      <button className="dark-action restaurant-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : selectedId ? 'Update table' : 'Create table'} <span aria-hidden="true">↗</span></button>
    </form>}
    {isLoading ? <p className="dashboard-subtitle">Loading tables...</p> : !restaurantId ? <div className="owner-empty-state"><h2>Create a restaurant first</h2><p>Tables belong to a restaurant. Add a restaurant before creating tables.</p></div> : tables.length === 0 ? <div className="owner-empty-state"><h2>No tables yet</h2><p>Create your first table to generate its QR code.</p><button className="dark-action" type="button" onClick={openNew}>Create table <span aria-hidden="true">+</span></button></div> : <div className="table-card-grid">{tables.map((table) => <article className="table-card" key={table.id}>
      <div className="table-card__details"><p className="dashboard-eyebrow">{isActive(table.is_active) ? 'Active' : 'Inactive'}</p><h2>{table.name}</h2><p>Table {table.table_number} · Capacity {table.capacity ?? '—'}</p><code>{table.qr_token || 'QR token unavailable'}</code><div className="restaurant-list-actions"><button className="text-action" type="button" onClick={() => openEdit(table)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(table)}>Delete</button></div></div>
      {table.qr_token && <TableQrCode table={table} />}
    </article>)}</div>}
  </section>
}

export default TablesManager
