import client from './client'

export const getStandings = (competitionId) =>
  client.get('/standings', { params: competitionId ? { competition_id: competitionId } : {} }).then(r => r.data)
export const getCompetitions = () => client.get('/standings/competitions').then(r => r.data)
export const getTeamCompetitions = (teamId) => client.get(`/teams/${teamId}/competitions`).then(r => r.data)
export const createStandings = (data) => client.post('/standings', data).then(r => r.data)
export const updateStanding = (id, data) => client.put(`/standings/${id}`, data).then(r => r.data)
