'use client'

import { useState, useRef } from 'react'

interface Fleet {
  id: number
  name: string
  faction_id: number
  current_system_id: number
  owner_user_id: number | null
  created_at: string
  status: 'in_system' | 'traveling'
  target_system_id?: number
}

interface FleetWidgetProps {
  fleets: Fleet[]
  onFleetSelect?: (fleet: Fleet) => void
  onFleetDoubleClick?: (fleet: Fleet) => void
  selectedFleetId?: number
}

const tok = {
  bg:           '#060b07',
  panelBg:      'rgba(4, 9, 5, 0.96)',
  border:       '#3d5c42',
  borderBright: '#ff8800',
  textDim:      '#6a8a6a',
  textBase:     '#a8c8a8',
  textHot:      '#ff8800',
  textGreen:    '#6adc7a',
}

function CornerBrackets({ color = '#ff8800' }: { color?: string }) {
  const s: React.CSSProperties = { position: 'absolute', width: 8, height: 8 }
  const b = `1px solid ${color}`
  return (
    <>
      <span style={{ ...s, top: -1, left:  -1, borderTop: b, borderLeft:  b }} />
      <span style={{ ...s, top: -1, right: -1, borderTop: b, borderRight: b }} />
      <span style={{ ...s, bottom: -1, left:  -1, borderBottom: b, borderLeft:  b }} />
      <span style={{ ...s, bottom: -1, right: -1, borderBottom: b, borderRight: b }} />
    </>
  )
}

export function FleetWidget({ fleets, onFleetSelect, onFleetDoubleClick, selectedFleetId }: FleetWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedFleet, setExpandedFleet] = useState<number | null>(null)
  const lastClickTime = useRef(0)
  const clickTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleFleetClick = (fleet: Fleet) => {
    const now = Date.now()
    if (now - lastClickTime.current < 300) {
      onFleetDoubleClick?.(fleet)
      if (clickTimeout.current) clearTimeout(clickTimeout.current)
    } else {
      setExpandedFleet(expandedFleet === fleet.id ? null : fleet.id)
      onFleetSelect?.(fleet)
      clickTimeout.current = setTimeout(() => {}, 300)
    }
    lastClickTime.current = now
  }

  return (
    <div style={{
      height: '100%',
      background: tok.bg,
      borderLeft: `1px solid ${tok.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Courier New', Courier, monospace",
    }}>

      {/* Header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${tok.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(3, 7, 4, 0.97)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6,
            background: tok.textGreen,
            boxShadow: `0 0 5px ${tok.textGreen}`,
            animation: 'fleetPulse 2.4s infinite',
          }} />
          <style>{`@keyframes fleetPulse { 0%,100%{opacity:1} 50%{opacity:0.25} }`}</style>
          <span style={{ color: tok.textBase, fontSize: 12, letterSpacing: '0.25em', fontWeight: 'bold' }}>
            FLEET ASSETS
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: tok.textDim,
            cursor: 'pointer',
            fontSize: 16,
            letterSpacing: '0.1em',
            padding: '2px 4px',
          }}
        >
          {isCollapsed ? '▼ EXPAND' : '▲ COLLAPSE'}
        </button>
      </div>

      {/* Fleet List */}
      {!isCollapsed && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {fleets.length === 0 ? (
            <div style={{
              color: tok.textDim, fontSize: 12, textAlign: 'center',
              padding: '32px 0', letterSpacing: '0.2em',
            }}>
              NO ASSETS DETECTED
            </div>
          ) : (
            fleets.map((fleet) => {
              const isSelected = selectedFleetId === fleet.id
              const isExpanded = expandedFleet === fleet.id
              const traveling = fleet.status === 'traveling'

              return (
                <div
                  key={fleet.id}
                  onClick={() => handleFleetClick(fleet)}
                  style={{
                    position: 'relative',
                    marginBottom: 6,
                    padding: '8px 10px',
                    background: isSelected ? 'rgba(106,220,122,0.07)' : 'rgba(4,9,5,0.6)',
                    border: `1px solid ${isSelected ? tok.borderBright : tok.border}`,
                    borderLeft: `3px solid ${isSelected ? tok.textBase : tok.border}`,
                    cursor: 'pointer',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = tok.borderBright
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = tok.border
                  }}
                >
                  {isSelected && <CornerBrackets color={tok.textBase} />}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: tok.textBase, fontSize: 13, fontWeight: 'bold', letterSpacing: '0.08em' }}>
                      {fleet.name.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: 16,
                      letterSpacing: '0.2em',
                      padding: '2px 6px',
                      border: `1px solid ${traveling ? tok.textHot : '#3d6a40'}`,
                      color: traveling ? tok.textHot : tok.textBase,
                      background: traveling ? 'rgba(200,168,64,0.08)' : 'rgba(106,220,122,0.06)',
                    }}>
                      {traveling ? '▶ TRANSIT' : '⚓ DOCKED'}
                    </span>
                  </div>

                  <div style={{ color: tok.textBase, fontSize: 13, letterSpacing: '0.15em' }}>
                    SHIPS: 2 &nbsp;|&nbsp; READINESS: 100%
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${tok.border}`,
        padding: '8px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: tok.textBase, fontSize: 11, letterSpacing: '0.2em' }}>
          OPERATIONAL: {fleets.length}
        </span>
        <span style={{ color: tok.textBase, fontSize: 11, letterSpacing: '0.2em' }}>
          ▸ DBL-CLICK: INSPECT
        </span>
      </div>
    </div>
  )
}