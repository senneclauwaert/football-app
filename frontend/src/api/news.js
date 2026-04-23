import client from './client'

export const getNews = () => client.get('/news').then(r => r.data)
export const getAllNews = () => client.get('/news/all').then(r => r.data)
export const getNewsItem = (id) => client.get(`/news/${id}`).then(r => r.data)
export const createNews = (data) => client.post('/news', data).then(r => r.data)
export const updateNews = (id, data) => client.put(`/news/${id}`, data).then(r => r.data)
export const deleteNews = (id) => client.delete(`/news/${id}`).then(r => r.data)
