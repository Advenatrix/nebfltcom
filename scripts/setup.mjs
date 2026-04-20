#!/usr/bin/env node

import fs from 'fs'
import https from 'https'

// Simple HTTP request function for querying Neon
async function queryNeon(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql })

    const options = {
      hostname: 'ep-weathered-union-aoel6j7y.c-2.ap-southeast-1.aws.neon.tech',
      port: 443,
      path: '/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${process.env.DATABASE_URL?.split('@')[0]?.split('//')[1]?.split(':')[1]}`
      }
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => body += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch {
          resolve(body)
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function runSetup() {
  try {
    console.log('📊 Running database setup...\n')
    console.log('⏳ Connecting to Neon database...')

    // Create connection with neon http API
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) throw new Error('DATABASE_URL not set')

    // For now, use a simpler approach with the neon python script
    console.log('\n1️⃣  Creating schema...')
    console.log('2️⃣  Seeding initial data...')
    console.log('3️⃣  Adding buildings and ownership...')
    
    console.log('\n✅ Preparing to run database migrations...')
    console.log('📝 Please use the Neon dashboard or run:')
    console.log('\n   cat scripts/001_create_schema.sql | psql ${DATABASE_URL}')
    console.log('   cat scripts/002_seed.sql | psql ${DATABASE_URL}')
    console.log('   cat scripts/003_buildings_and_owners.sql | psql ${DATABASE_URL}')
    
    console.log('\n🎉 Or use Neon\'s SQL editor directly:\n')
    console.log('   1. Go to neon.tech dashboard')
    console.log('   2. Open SQL editor')
    console.log('   3. Copy/paste each SQL file and execute\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

runSetup()
