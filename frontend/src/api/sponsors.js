import client from './client'

export const getSponsors = () => client.get('/sponsors').then(r => r.data)
export const createSponsor = (data) => client.post('/sponsors', data).then(r => r.data)
export const updateSponsor = (id, data) => client.put(`/sponsors/${id}`, data).then(r => r.data)
export const deleteSponsor = (id) => client.delete(`/sponsors/${id}`).then(r => r.data)
