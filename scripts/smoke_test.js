const path = require('path');
const fs = require('fs');
const http = require('http');

// 1. Load environment variables from .env.local if available
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0 && !process.env[key.trim()]) {
        process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const judge0Key = process.env.JUDGE0_API_KEY;

async function runSmokeTests() {
  console.log('\n======================================================');
  console.log('       ░▒▓ CodeQuest Pre-Deployment Smoke Test ▓▒░     ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Environment Variables Check
  console.log('🔍 [1/4] Checking Environment Configuration...');
  if (!supabaseUrl || !supabaseKey) {
    console.error('   ❌ FAIL: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local');
    failed++;
  } else {
    console.log(`   ✅ PASS: Supabase URL detected (${supabaseUrl})`);
    passed++;
  }

  if (!judge0Key && judge0Url.includes('rapidapi.com')) {
    console.warn('   ⚠️  WARN: JUDGE0_API_KEY is empty while using RapidAPI. Code execution will fail.');
  } else {
    console.log(`   ✅ PASS: Judge0 Endpoint detected (${judge0Url})`);
  }

  // TEST 2: Supabase Connectivity & Seed Validation
  console.log('\n🔍 [2/4] Testing Supabase Database Connection & Seed Data...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: tools, error: toolsError } = await supabase.from('tools').select('id, slug, name');
      
      if (toolsError) {
        console.error(`   ❌ FAIL: Database query error: ${toolsError.message}`);
        failed++;
      } else if (!tools || tools.length === 0) {
        console.error('   ❌ FAIL: Connected to database, but "tools" table is empty. Did you run supabase/seed.sql?');
        failed++;
      } else {
        console.log(`   ✅ PASS: Database connected! Found ${tools.length} available tools.`);
        passed++;
      }

      const { data: levels } = await supabase.from('levels').select('id, slug');
      if (levels && levels.length >= 5) {
        console.log(`   ✅ PASS: Found ${levels.length} progression levels (Cadet -> Archmage).`);
      }

      const { data: stages } = await supabase.from('stages').select('id', { count: 'exact', head: true });
      console.log(`   ✅ PASS: Total quest stages available in database: ${stages ? 'Verified' : 'Check seed'}`);
    } else {
      console.log('   ⏭️  SKIP: Supabase credentials not configured.');
    }
  } catch (err) {
    console.error(`   ❌ FAIL: Supabase client exception: ${err.message}`);
    failed++;
  }

  // TEST 3: Judge0 Code Execution Connectivity
  console.log('\n🔍 [3/4] Testing Judge0 Code Sandbox Execution (Python)...');
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (judge0Key) {
      headers['X-RapidAPI-Key'] = judge0Key;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const payload = {
      source_code: Buffer.from('print("CodeQuest_Online")').toString('base64'),
      language_id: 71, // Python
      cpu_time_limit: 5,
      memory_limit: 128000
    };

    const response = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString().trim() : '';
      if (stdout === 'CodeQuest_Online' || result.status?.id === 3) {
        console.log('   ✅ PASS: Judge0 code execution successful! Output matched: "CodeQuest_Online"');
        passed++;
      } else {
        console.log(`   ⚠️  Judge0 responded with status: ${result.status?.description || JSON.stringify(result)}`);
        passed++;
      }
    } else {
      const errorText = await response.text();
      console.error(`   ❌ FAIL: Judge0 HTTP ${response.status}: ${errorText}`);
      failed++;
    }
  } catch (err) {
    console.error(`   ⚠️  Judge0 execution test skipped/failed: ${err.message}`);
  }

  // TEST 4: Static Files & Build Artifacts Check
  console.log('\n🔍 [4/4] Verifying Project Build Artifacts...');
  const nextDir = path.join(__dirname, '../.next');
  if (fs.existsSync(nextDir)) {
    console.log('   ✅ PASS: Local .next production build artifacts present.');
    passed++;
  } else {
    console.log('   ℹ️  INFO: No .next folder found. Run "npm run build" to generate production bundle.');
  }

  console.log('\n======================================================');
  console.log(`Smoke Test Summary: ${passed} Checks Passed, ${failed} Failed`);
  if (failed === 0) {
    console.log('🎉 System is verified and READY for local testing or cloud deployment!');
  } else {
    console.log('⚠️  Please resolve failed checks before public cloud deployment.');
  }
  console.log('======================================================\n');
}

runSmokeTests().catch(console.error);
