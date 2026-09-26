import { useCallback, useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config/api'

const emptyFoodItem = { menu_id: '', category_id: '', name: '', description: '', price: '', image_url: '', display_order: 0, is_available: true }
const isActive = (value) => value === true || value === 1 || value === '1' || value === 'true'

function getItems(result) {
  if (Array.isArray(result)) return result
  if (!result || typeof result !== 'object') return []
  for (const key of ['menu_items', 'items', 'menus', 'categories', 'restaurants', 'data', 'results']) {
    if (Array.isArray(result[key])) return result[key]
    if (result[key] && typeof result[key] === 'object') {
      const nested = getItems(result[key])
      if (nested.length) return nested
    }
  }
  return []
}

function MenuManager({ token, listRestaurants, listCategories, listMenus, createMenu, listMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem }) {
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [restaurantId, setRestaurantId] = useState('')
  const [menuId, setMenuId] = useState('')
  const [form, setForm] = useState(emptyFoodItem)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [removeImage, setRemoveImage] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const loadData = useCallback(async (id) => {
    if (!id) { setItems([]); setIsLoading(false); return }
    setIsLoading(true)
    try {
      const itemResult = await listMenuItems(id, token)
      setItems(getItems(itemResult))
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load food items.' })
    } finally { setIsLoading(false) }
  }, [listMenuItems, token])

  const loadMenus = useCallback(async (id) => {
    if (!id) { setMenuId(''); setItems([]); setIsLoading(false); return }
    setIsLoading(true)
    setItems([])
    try {
      const result = await listMenus(id, token)
      let availableMenus = getItems(result)
      if (availableMenus.length === 0) {
        const createResult = await createMenu({ restaurant_id: Number(id), name: 'Food', is_published: true }, token)
        const createdMenu = createResult?.menu || createResult?.data || createResult
        availableMenus = createdMenu?.id ? [createdMenu] : getItems(await listMenus(id, token))
      }
      const firstId = availableMenus[0]?.id ? String(availableMenus[0].id) : ''
      setMenuId(firstId)
      if (!firstId) setStatus({ type: 'error', message: 'Could not prepare food items for this restaurant.' })
      await loadData(firstId)
    } catch (error) {
      setMenuId('')
      setItems([])
      setIsLoading(false)
      setStatus({ type: 'error', message: error.message?.replace(/menus?/gi, 'food items') || 'Could not load food items.' })
    }
  }, [createMenu, listMenus, loadData, token])

  const loadCategories = useCallback(async (id) => {
    if (!id) { setCategories([]); return }
    try {
      const result = await listCategories(id, token)
      setCategories(getItems(result))
    } catch (error) {
      setCategories([])
      setStatus({ type: 'error', message: error.message || 'Could not load categories.' })
    }
  }, [listCategories, token])

  useEffect(() => {
    void Promise.resolve().then(async () => {
      try {
        const result = await listRestaurants(token)
        const availableRestaurants = getItems(result)
        setRestaurants(availableRestaurants)
        const firstId = availableRestaurants[0]?.id ? String(availableRestaurants[0].id) : ''
        setRestaurantId(firstId)
        await Promise.all([loadMenus(firstId), loadCategories(firstId)])
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Could not load restaurants.' })
        setIsLoading(false)
      }
    })
  }, [listRestaurants, loadCategories, loadMenus, token])

  const openNew = () => {
    setSelectedId(null)
    setForm({ ...emptyFoodItem, menu_id: menuId, category_id: categories[0]?.id ? String(categories[0].id) : '' })
    setImageFile(null)
    setImagePreview('')
    setRemoveImage(false)
    setStatus({ type: '', message: '' })
    setIsFormOpen(true)
  }

  const openEdit = async (item) => {
    setSelectedId(item.id)
    setForm({ ...emptyFoodItem, ...item, menu_id: menuId, category_id: item.category_id ?? item.category?.id ?? '', is_available: item.is_available === undefined ? true : isActive(item.is_available) })
    setImageFile(null)
    setImagePreview(getImageUrl(item.image_url))
    setRemoveImage(false)
    setIsFormOpen(true)
    setStatus({ type: '', message: '' })
    try {
      const result = await getMenuItem(item.id, token)
      const loadedItem = result?.menu_item || result?.item || result?.data || result
      setForm({ ...emptyFoodItem, ...loadedItem, menu_id: loadedItem.menu_id || menuId, category_id: loadedItem.category_id ?? loadedItem.category?.id ?? '', is_available: loadedItem.is_available === undefined ? true : isActive(loadedItem.is_available) })
      setImagePreview(getImageUrl(loadedItem.image_url))
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not load food details.' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    try {
      const payload = { name: form.name, description: form.description, menu_id: Number(menuId), category_id: form.category_id ? Number(form.category_id) : null, price: Number(form.price), display_order: Number(form.display_order), is_available: isActive(form.is_available) }
      let result
      if (imageFile || (selectedId && removeImage)) {
        const formData = new FormData()
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, key === 'is_available' ? (value ? '1' : '0') : String(value ?? ''))
        })
        if (imageFile) formData.append('image', imageFile)
        if (selectedId && removeImage) formData.append('remove_image', 'true')
        result = selectedId
          ? await updateMenuItem(formData, token, selectedId)
          : await createMenuItem(formData, token)
      } else {
        result = selectedId
          ? await updateMenuItem({ ...payload, id: selectedId }, token, selectedId)
          : await createMenuItem(payload, token)
      }
      setStatus({ type: 'success', message: result?.message?.replace(/menu/gi, 'food') || (selectedId ? 'Food item updated.' : 'Food item created.') })
      setIsFormOpen(false)
      setImageFile(null)
      setImagePreview('')
      setRemoveImage(false)
      await loadData(menuId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save food item.' })
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return
    try {
      const result = await deleteMenuItem(item.id, token)
      setStatus({ type: 'success', message: result?.message?.replace(/menu/gi, 'food') || 'Food item deleted.' })
      await loadData(menuId)
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not delete food item.' })
    }
  }

  const selectRestaurant = (event) => {
    const id = event.target.value
    setRestaurantId(id)
    setMenuId('')
    setIsFormOpen(false)
    void Promise.all([loadMenus(id), loadCategories(id)])
  }

  const categoryNameFor = (item) => {
    const linkedCategory = item.category
    if (typeof linkedCategory === 'string') return linkedCategory
    if (linkedCategory?.name) return linkedCategory.name
    const categoryId = item.category_id ?? item.categoryId ?? linkedCategory?.id
    return categories.find((category) => String(category.id) === String(categoryId))?.name || '-'
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
    if (/^(https?:|data:|blob:)/i.test(imagePath)) return imagePath
    return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`
  }

  const selectImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Choose a JPEG, PNG, WebP, or GIF image up to 5 MB.' })
      event.target.value = ''
      return
    }
    setImageFile(file)
    setRemoveImage(false)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(String(reader.result))
    reader.onerror = () => setStatus({ type: 'error', message: 'Could not read that image.' })
    reader.readAsDataURL(file)
  }

  return <section className="category-manager">
    <header className="manager-heading"><div><p className="dashboard-eyebrow">Restaurant management</p><h1>Food items.</h1><p className="dashboard-subtitle">Add and organize this restaurant’s food items by category.</p></div><button className="dark-action" type="button" onClick={openNew} disabled={!restaurantId || !menuId}>Add food item <span aria-hidden="true">+</span></button></header>
    {status.message && <p className={`restaurant-status restaurant-status--${status.type}`} role="status">{status.message}</p>}
    <label className="restaurant-selector"><span>Restaurant</span><select value={restaurantId} onChange={selectRestaurant} disabled={isLoading}><option value="">Select a restaurant</option>{restaurants.map((restaurant) => <option value={restaurant.id} key={restaurant.id}>{restaurant.name}</option>)}</select></label>
    {isFormOpen && <form className="restaurant-form manager-form" onSubmit={handleSubmit}>
      <div className="manager-form__heading"><h2>{selectedId ? 'Edit food item' : 'New food item'}</h2><button className="text-action" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button></div>
      <label className="dashboard-field"><span>Category</span><select name="category_id" value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}><option value="">No category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
      <label className="dashboard-field"><span>Food name</span><input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Grilled chicken" required /></label>
      <label className="dashboard-field"><span>Price</span><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
      <label className="dashboard-field"><span>Description</span><textarea name="description" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A short description of this food item" rows="3" /></label>
      <label className="dashboard-field"><span>Image</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={selectImage} />{imagePreview && <span className="image-selection-preview"><img src={imagePreview} alt="Food item preview" /><button className="text-action" type="button" onClick={() => { setImageFile(null); setImagePreview(''); setRemoveImage(Boolean(form.image_url)) }}>Remove image</button></span>}</label>
      <label className="dashboard-field category-toggle"><span>Available</span><input name="is_available" type="checkbox" checked={isActive(form.is_available)} onChange={(event) => setForm({ ...form, is_available: event.target.checked })} /></label>
      <button className="dark-action restaurant-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : selectedId ? 'Update food item' : 'Create food item'} <span aria-hidden="true">↗</span></button>
    </form>}
    {isLoading ? <p className="dashboard-subtitle">Loading food items...</p> : !restaurantId ? <div className="owner-empty-state"><h2>Create a restaurant first</h2><p>Food items belong to a restaurant. Add a restaurant before creating them.</p></div> : menuId && (items.length === 0 ? <div className="owner-empty-state"><h2>No food items yet</h2><p>Add the first item to a category for this restaurant.</p><button className="dark-action" type="button" onClick={openNew}>Create food item <span aria-hidden="true">+</span></button></div> : <div className="category-table-wrap"><table className="category-table"><thead><tr><th>Name</th><th>Category</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{categoryNameFor(item)}</td><td>{item.description || '-'}</td><td><span className="profile-status">{isActive(item.is_available) ? 'Available' : 'Unavailable'}</span></td><td><div className="restaurant-list-actions"><button className="text-action" type="button" onClick={() => openEdit(item)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(item)}>Delete</button></div></td></tr>)}</tbody></table></div>)}
  </section>
}

export default MenuManager

