import client from './client'

export const getProducts = () => client.get('/shop/items').then(r => r.data)
export const getAllProducts = () => client.get('/shop/items/all').then(r => r.data)
export const getProduct = (id) => client.get(`/shop/items/${id}`).then(r => r.data)
export const createProduct = (data) => client.post('/shop/items', data).then(r => r.data)
export const updateProduct = (id, data) => client.put(`/shop/items/${id}`, data).then(r => r.data)
export const deleteProduct = (id) => client.delete(`/shop/items/${id}`).then(r => r.data)

export const createOrder = (data) => client.post('/shop/orders', data).then(r => r.data)
export const getOrders = () => client.get('/shop/orders').then(r => r.data)
export const updateOrder = (id, data) => client.put(`/shop/orders/${id}`, data).then(r => r.data)
