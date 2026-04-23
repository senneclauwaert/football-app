import client from './client'

export const getStats = () => client.get('/admin/stats').then(r => r.data)
export const getScraperRuns = () => client.get('/admin/scraper/runs').then(r => r.data)
export const triggerScraper = () => client.post('/admin/scraper/run').then(r => r.data)
