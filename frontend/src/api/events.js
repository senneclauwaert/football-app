import client from './client'

export const getEvents = () => client.get('/events').then(r => r.data)
export const getAllEvents = () => client.get('/events/all').then(r => r.data)
export const getEvent = (id) => client.get(`/events/${id}`).then(r => r.data)
export const createEvent = (data) => client.post('/events', data).then(r => r.data)
export const updateEvent = (id, data) => client.put(`/events/${id}`, data).then(r => r.data)
export const deleteEvent = (id) => client.delete(`/events/${id}`).then(r => r.data)
