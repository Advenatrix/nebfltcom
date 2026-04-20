import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const starSystems = await sql`
      SELECT id, name, x, y, star_type, star_color, description
      FROM star_systems
      ORDER BY name
    `

    return NextResponse.json(starSystems)
  } catch (error) {
    console.error('Error fetching star systems:', error)
    return NextResponse.json(
      { error: 'Database connection failed. Please check your DATABASE_URL environment variable.' },
      { status: 500 }
    )
  }
}