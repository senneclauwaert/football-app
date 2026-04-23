import client from './client'

export const getMatches = (params = {}) => client.get('/matches', { params }).then(r => r.data)
export const getMatch = (id) => client.get(`/matches/${id}`).then(r => r.data)
export const createMatch = (data) => client.post('/matches', data).then(r => r.data)
export const updateMatch = (id, data) => client.put(`/matches/${id}`, data).then(r => r.data)
export const deleteMatch = (id) => client.delete(`/matches/${id}`).then(r => r.data)
export const addMatchEvent = (matchId, data) => client.post(`/matches/${matchId}/events`, data).then(r => r.data)
export const deleteMatchEvent = (matchId, eventId) => client.delete(`/matches/${matchId}/events/${eventId}`).then(r => r.data)
export const updateLineup = (matchId, data) => client.put(`/matches/${matchId}/lineup`, data).then(r => r.data)
