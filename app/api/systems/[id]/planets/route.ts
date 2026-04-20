import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const systemId = parseInt(params.id)

    if (isNaN(systemId)) {
      return NextResponse.json({ error: 'Invalid system ID' }, { status: 400 })
    }

    const planets = await sql`
      SELECT id, name, orbit_radius, orbit_period_days, orbit_phase,
             radius_km, planet_type, color
      FROM planets
      WHERE system_id = ${systemId}
      ORDER BY orbit_radius
    `

    return NextResponse.json(planets)
  } catch (error) {
    console.error('Error fetching planets:', error)
    return NextResponse.json({ error: 'Failed to fetch planets' }, { status: 500 })
  }
}