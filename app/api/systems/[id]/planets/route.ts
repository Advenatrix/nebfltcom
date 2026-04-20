import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const systemId = parseInt(id)

    if (isNaN(systemId)) {
      console.error(`Invalid system ID: ${id}`)
      return NextResponse.json({ error: 'Invalid system ID' }, { status: 400 })
    }

    console.log(`Fetching planets for system ${systemId}`)

    const planets = await sql`
      SELECT id, name, orbit_radius, orbit_period_days, orbit_phase,
             radius_km, planet_type, color
      FROM planets
      WHERE system_id = ${systemId}
      ORDER BY orbit_radius
    `

    console.log(`Found ${planets.length} planets for system ${systemId}`)
    return NextResponse.json(planets)
  } catch (error) {
    console.error('Error fetching planets:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch planets',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    )
  }
}