import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fleetId = parseInt(id)

    if (isNaN(fleetId)) {
      return NextResponse.json({ error: 'Invalid fleet ID' }, { status: 400 })
    }

    const ships = await sql`
      SELECT 
        s.id, s.fleet_id, s.name, s.hull_class, s.hull_hp, 
        s.crew, s.crew_max, s.ammo, s.ammo_max,
        COUNT(ws.id) as weapon_count,
        COUNT(m.id) as magazine_count
      FROM ships s
      LEFT JOIN weapon_slots ws ON s.id = ws.ship_id
      LEFT JOIN magazines m ON s.id = m.ship_id
      WHERE s.fleet_id = ${fleetId}
      GROUP BY s.id
      ORDER BY s.hull_class DESC, s.name
    `

    return NextResponse.json(ships)
  } catch (error) {
    console.error('Error fetching ships:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch ships',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    )
  }
}