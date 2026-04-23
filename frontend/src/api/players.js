import client from './client'

export const getPlayers = (teamId) =>
  client.get('/players', { params: teamId ? { team_id: teamId } : {} }).then(r => r.data)
export const getPlayer = (id) => client.get(`/players/${id}`).then(r => r.data)
export const createPlayer = (data) => client.post('/players', data).then(r => r.data)
export const updatePlayer = (id, data) => client.put(`/players/${id}`, data).then(r => r.data)
export const deletePlayer = (id) => client.delete(`/players/${id}`).then(r => r.data)
