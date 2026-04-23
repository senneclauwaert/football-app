import client from './client'

export const getTeams = () => client.get('/teams').then(r => r.data)
export const getTeam = (slug) => client.get(`/teams/${slug}`).then(r => r.data)
export const createTeam = (data) => client.post('/teams', data).then(r => r.data)
export const updateTeam = (id, data) => client.put(`/teams/${id}`, data).then(r => r.data)
export const deleteTeam = (id) => client.delete(`/teams/${id}`).then(r => r.data)
