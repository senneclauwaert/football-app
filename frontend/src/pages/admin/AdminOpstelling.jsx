import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import Icon from '../../components/Icon'
import Pitch, { FORMATION_SLOTS } from '../../components/Pitch'
import { getMatch, updateMatch, updateLineup } from '../../api/matches'
import { getPlayers } from '../../api/players'

const FORMATIONS = Object.keys(FORMATION_SLOTS)

const SLOT_LABELS = {
  K: 'Keeper', GK: 'Keeper',
  LB: 'Linkerback', RB: 'Rechterback',
  CB: 'Centrale back', SW: 'Sweeper',
  LV: 'Linker vleugelspeler', RV: 'Rechter vleugelspeler',
  DM: 'Def. middenvelder', CDM: 'Def. middenvelder',
  CM: 'Centrale middenvelder', LM: 'Linker midveld', RM: 'Rechter midveld',
  AM: 'Aanv. middenvelder', CAM: 'Aanv. middenvelder',
  SP: 'Spits', ST: 'Spits', CF: 'Diepe spits',
}

function emptySlot(slotDef) {
  return { role: slotDef.role, player_name: '', jersey_number: '', player_id: null, x: slotDef.x, y: slotDef.y, is_starting: true }
}

function buildLineupEntries(homeSlots, awaySlots, homeBench, awayBench) {
  const entries = []

  homeSlots.forEach(s => {
    if (!s.player_name.trim()) return
    entries.push({
      player_name:   s.player_name.trim(),
      jersey_number: s.jersey_number !== '' ? parseInt(s.jersey_number) : null,
      player_id:     s.player_id || null,
      position_x:    s.x,
      position_y:    s.y,
      is_starting:   true,
      is_our_team:   true,
    })
  })

  awaySlots.forEach(s => {
    if (!s.player_name.trim()) return
    entries.push({
      player_name:   s.player_name.trim(),
      jersey_number: s.jersey_number !== '' ? parseInt(s.jersey_number) : null,
      player_id:     null,
      position_x:    s.x,
      position_y:    s.y,
      is_starting:   true,
      is_our_team:   false,
    })
  })

  homeBench.forEach(b => {
    if (!b.player_name.trim()) return
    entries.push({
      player_name:   b.player_name.trim(),
      jersey_number: b.jersey_number !== '' ? parseInt(b.jersey_number) : null,
      player_id:     b.player_id || null,
      position_x:    null,
      position_y:    null,
      is_starting:   false,
      is_our_team:   true,
    })
  })

  awayBench.forEach(b => {
    if (!b.player_name.trim()) return
    entries.push({
      player_name:   b.player_name.trim(),
      jersey_number: b.jersey_number !== '' ? parseInt(b.jersey_number) : null,
      player_id:     null,
      position_x:    null,
      position_y:    null,
      is_starting:   false,
      is_our_team:   false,
    })
  })

  return entries
}

function SlotRow({ slot, index, onChange, players, isHome }) {
  const label = SLOT_LABELS[slot.role] || slot.role
  const manualKey = slot.player_name && !slot.player_id ? '__manual__' + slot.player_name : null
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px 1fr 52px',
      gap: 8,
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid #1a1a1a',
    }}>
      <span style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
        {label}
      </span>
      {isHome && players.length > 0 ? (
        <select
          value={slot.player_id ? String(slot.player_id) : manualKey || ''}
          onChange={e => {
            const val = e.target.value
            if (val === '') {
              onChange(index, { player_name: '', jersey_number: '', player_id: null })
            } else if (val.startsWith('__manual__')) {
              onChange(index, { player_name: val.replace('__manual__', ''), player_id: null })
            } else {
              const p = players.find(p => String(p.id) === val)
              if (p) onChange(index, {
                player_name: `${p.first_name} ${p.last_name}`,
                jersey_number: p.jersey_number ?? '',
                player_id: p.id,
              })
            }
          }}
          style={selectStyle}
        >
          <option value="">— Niet ingevuld —</option>
          {manualKey && (
            <option value={manualKey}>{slot.player_name}</option>
          )}
          {players.map(p => (
            <option key={p.id} value={String(p.id)}>
              {p.jersey_number ? `#${p.jersey_number} ` : ''}{p.first_name} {p.last_name}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={slot.player_name}
          onChange={e => onChange(index, { player_name: e.target.value })}
          style={inputStyle}
          placeholder="Naam speler..."
        />
      )}
      <input
        type="number"
        min="1"
        max="99"
        value={slot.jersey_number}
        onChange={e => onChange(index, { jersey_number: e.target.value })}
        style={{ ...inputStyle, textAlign: 'center', paddingLeft: 6, paddingRight: 6 }}
        placeholder="#"
      />
    </div>
  )
}

function BenchRow({ player, index, onChange, onRemove, players, isHome }) {
  const manualKey = player.player_name && !player.player_id ? '__manual__' + player.player_name : null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 28px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
      {isHome && players.length > 0 ? (
        <select
          value={player.player_id ? String(player.player_id) : manualKey || ''}
          onChange={e => {
            const val = e.target.value
            if (!val) {
              onChange(index, { player_name: '', jersey_number: '', player_id: null })
            } else {
              const p = players.find(p => String(p.id) === val)
              if (p) onChange(index, {
                player_name: `${p.first_name} ${p.last_name}`,
                jersey_number: p.jersey_number ?? '',
                player_id: p.id,
              })
            }
          }}
          style={selectStyle}
        >
          <option value="">— Kies speler —</option>
          {manualKey && (
            <option value={manualKey}>{player.player_name}</option>
          )}
          {players.map(p => (
            <option key={p.id} value={String(p.id)}>
              {p.jersey_number ? `#${p.jersey_number} ` : ''}{p.first_name} {p.last_name}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={player.player_name}
          onChange={e => onChange(index, { player_name: e.target.value })}
          style={inputStyle}
          placeholder="Naam..."
        />
      )}
      <input
        type="number"
        min="1"
        value={player.jersey_number}
        onChange={e => onChange(index, { jersey_number: e.target.value })}
        style={{ ...inputStyle, textAlign: 'center', paddingLeft: 6, paddingRight: 6 }}
        placeholder="#"
      />
      <button onClick={() => onRemove(index)} style={removeBtnStyle}>
        <Icon name="x" size={12} color="#ef4444" />
      </button>
    </div>
  )
}

export default function AdminOpstelling() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [match, setMatch] = useState(null)
  const [players, setPlayers] = useState([])
  const [formation, setFormation] = useState('4-3-3')
  const [homeSlots, setHomeSlots] = useState([])
  const [awaySlots, setAwaySlots] = useState([])
  const [homeBench, setHomeBench] = useState([])
  const [awayBench, setAwayBench] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Initialize slots from formation
  const initSlots = (fm) => {
    const slots = FORMATION_SLOTS[fm] || FORMATION_SLOTS['4-3-3']
    return slots.map(s => emptySlot(s))
  }

  useEffect(() => {
    Promise.all([getMatch(id), getPlayers()])
      .then(([matchData, playerData]) => {
        setMatch(matchData)
        const fm = matchData.formation || '4-3-3'
        setFormation(fm)

        if (playerData) {
          const teamId = matchData.team_id
          setPlayers(teamId ? playerData.filter(p => p.team_id === teamId && p.is_active) : playerData)
        }

        // Load existing lineup if present
        const existing = matchData.lineups || []
        if (existing.length > 0) {
          const slots = FORMATION_SLOTS[fm] || FORMATION_SLOTS['4-3-3']
          const homeStart = existing.filter(l => l.is_our_team && l.is_starting)
          const awayStart = existing.filter(l => !l.is_our_team && l.is_starting)
          const homeB = existing.filter(l => l.is_our_team && !l.is_starting)
          const awayB = existing.filter(l => !l.is_our_team && !l.is_starting)

          setHomeSlots(slots.map((s, i) => {
            const e = homeStart[i]
            if (!e) return emptySlot(s)
            return {
              role: s.role, x: e.position_x ?? s.x, y: e.position_y ?? s.y,
              player_name:   e.player_name || '',
              jersey_number: e.jersey_number ?? '',
              player_id:     e.player_id || null,
              is_starting:   true,
            }
          }))
          setAwaySlots(slots.map((s, i) => {
            const e = awayStart[i]
            if (!e) return emptySlot(s)
            return {
              role: s.role, x: e.position_x ?? s.x, y: e.position_y ?? s.y,
              player_name:   e.player_name || '',
              jersey_number: e.jersey_number ?? '',
              player_id:     null,
              is_starting:   true,
            }
          }))
          setHomeBench(homeB.map(e => ({ player_name: e.player_name || '', jersey_number: e.jersey_number ?? '', player_id: e.player_id || null })))
          setAwayBench(awayB.map(e => ({ player_name: e.player_name || '', jersey_number: e.jersey_number ?? '', player_id: null })))
        } else {
          setHomeSlots(initSlots(fm))
          setAwaySlots(initSlots(fm))
        }

        setLoading(false)
      })
      .catch(() => { setError('Kon wedstrijd niet laden'); setLoading(false) })
  }, [id])

  const handleFormationChange = (fm) => {
    setFormation(fm)
    const slots = FORMATION_SLOTS[fm] || FORMATION_SLOTS['4-3-3']
    // Remap existing players to new slots (keep names, reset positions)
    setHomeSlots(prev => slots.map((s, i) => ({ ...emptySlot(s), player_name: prev[i]?.player_name || '', jersey_number: prev[i]?.jersey_number || '', player_id: prev[i]?.player_id || null })))
    setAwaySlots(prev => slots.map((s, i) => ({ ...emptySlot(s), player_name: prev[i]?.player_name || '', jersey_number: prev[i]?.jersey_number || '', player_id: prev[i]?.player_id || null })))
  }

  const updateHomeSlot = (i, patch) => setHomeSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  const updateAwaySlot = (i, patch) => setAwaySlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  const updateHomeBench = (i, patch) => setHomeBench(prev => prev.map((b, idx) => idx === i ? { ...b, ...patch } : b))
  const updateAwayBench = (i, patch) => setAwayBench(prev => prev.map((b, idx) => idx === i ? { ...b, ...patch } : b))

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save formation on match
      await updateMatch(id, { formation })
      // Save lineup
      const entries = buildLineupEntries(homeSlots, awaySlots, homeBench, awayBench)
      await updateLineup(id, entries)
      navigate('/admin/wedstrijden')
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  // Build live preview lineup for Pitch
  const previewLineups = [
    ...homeSlots.filter(s => s.player_name.trim()).map(s => ({
      player_name: s.player_name, jersey_number: s.jersey_number || null,
      position_x: s.x, position_y: s.y, is_starting: true, is_our_team: true,
    })),
    ...awaySlots.filter(s => s.player_name.trim()).map(s => ({
      player_name: s.player_name, jersey_number: s.jersey_number || null,
      position_x: s.x, position_y: s.y, is_starting: true, is_our_team: false,
    })),
  ]

  if (loading) return <AdminLayout><Spinner /></AdminLayout>
  if (error) return <AdminLayout><div style={{ color: '#ef4444', padding: 32 }}>{error}</div></AdminLayout>

  const opponent = match?.opponent_name || match?.opponent || 'Tegenstander'

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button onClick={() => navigate('/admin/wedstrijden')} style={backBtnStyle}>
          <Icon name="chevronLeft" size={16} />
        </button>
        <div>
          <h1 style={pageTitle}>OPSTELLING</h1>
          <p style={pageSub}>vs {opponent}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ ...pageSub, display: 'flex', alignItems: 'center', gap: 8 }}>
            Formatie
            <select
              value={formation}
              onChange={e => handleFormationChange(e.target.value)}
              style={{ ...inputStyle, width: 120 }}
            >
              {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
            {saving ? 'Opslaan...' : 'Opstelling opslaan'}
          </button>
        </div>
      </div>

      {/* Two-column: pitch preview + player management */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' }}>

        {/* Pitch preview */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Live preview
          </div>
          <Pitch lineups={previewLineups} events={[]} formation={formation} />
        </div>

        {/* Player management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Home & Away side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Home team */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff6a13', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6200', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Toekomst Relegem
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Basiself</div>
              {homeSlots.map((slot, i) => (
                <SlotRow
                  key={i}
                  slot={slot}
                  index={i}
                  onChange={updateHomeSlot}
                  players={players}
                  isHome={true}
                />
              ))}

              {/* Home bench */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Bank</div>
                {homeBench.map((b, i) => (
                  <BenchRow
                    key={i}
                    player={b}
                    index={i}
                    onChange={updateHomeBench}
                    onRemove={i => setHomeBench(prev => prev.filter((_, idx) => idx !== i))}
                    players={players}
                    isHome={true}
                  />
                ))}
                <button
                  onClick={() => setHomeBench(prev => [...prev, { player_name: '', jersey_number: '', player_id: null }])}
                  style={addBtnStyle}
                >
                  <Icon name="plus" size={12} /> Bankspeler toevoegen
                </button>
              </div>
            </div>

            {/* Away team */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0a0a0a', border: '1px solid #ff6a13', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {opponent}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Basiself</div>
              {awaySlots.map((slot, i) => (
                <SlotRow
                  key={i}
                  slot={slot}
                  index={i}
                  onChange={updateAwaySlot}
                  players={[]}
                  isHome={false}
                />
              ))}

              {/* Away bench */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Bank</div>
                {awayBench.map((b, i) => (
                  <BenchRow
                    key={i}
                    player={b}
                    index={i}
                    onChange={updateAwayBench}
                    onRemove={i => setAwayBench(prev => prev.filter((_, idx) => idx !== i))}
                    players={[]}
                    isHome={false}
                  />
                ))}
                <button
                  onClick={() => setAwayBench(prev => [...prev, { player_name: '', jersey_number: '', player_id: null }])}
                  style={addBtnStyle}
                >
                  <Icon name="plus" size={12} /> Bankspeler toevoegen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#555', fontSize: 13, padding: 32 }}>
      <div style={{ width: 18, height: 18, border: '2px solid #FF6200', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Laden...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const pageTitle = { fontFamily: 'Anton, Impact, sans-serif', fontSize: 28, color: '#fff', margin: 0, letterSpacing: 1 }
const pageSub = { color: '#555', fontSize: 13, margin: '4px 0 0' }
const inputStyle = { padding: '7px 10px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 0, color: '#fff', fontSize: 12, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle }
const primaryBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#FF6200', border: 'none', borderRadius: 0, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }
const backBtnStyle = { padding: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 0, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }
const addBtnStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'transparent', border: '1px dashed #333', borderRadius: 0, color: '#555', fontSize: 11, cursor: 'pointer', marginTop: 4, width: '100%', justifyContent: 'center' }
const removeBtnStyle = { padding: '4px 6px', background: '#ef444418', border: 'none', borderRadius: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }
