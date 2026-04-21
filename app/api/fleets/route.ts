import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const fleets = await sql`
      SELECT 
        f.id, f.name, f.faction_id, f.current_system_id, f.current_planet_id, f.owner_user_id, f.created_at,
        ss.name as system_name,
        p.name as planet_name,
        COUNT(s.id) as ship_count
      FROM fleets f
      JOIN star_systems ss ON f.current_system_id = ss.id
      LEFT JOIN planets p ON f.current_planet_id = p.id
      LEFT JOIN ships s ON f.id = s.fleet_id
      GROUP BY f.id, ss.name, p.name
      ORDER BY f.name
    `

    return NextResponse.json(fleets)
  } catch (error) {
    console.error('Error fetching fleets:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch fleets',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, systemId, planetId } = body

    if (!name) {
      return NextResponse.json({ error: 'Fleet name required' }, { status: 400 })
    }

    const systemIdNum = systemId || 1
    const planetIdNum = planetId || null

    const result = await sql`
      INSERT INTO fleets (name, faction_id, current_system_id, current_planet_id, owner_user_id)
      VALUES (${name}, 1, ${systemIdNum}, ${planetIdNum}, 1)
      RETURNING id, name, faction_id, current_system_id, current_planet_id, owner_user_id, created_at
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating fleet:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create fleet' },
      { status: 500 }
    )
  }
}