import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const planets = await sql`
      SELECT id, name, system_id, orbit_radius, planet_type, color
      FROM planets
      ORDER BY system_id, orbit_radius
    `
    return NextResponse.json(planets)
  } catch (error) {
    console.error('Error fetching planets:', error)
    return NextResponse.json({ error: 'Failed to fetch planets' }, { status: 500 })
  }
}
