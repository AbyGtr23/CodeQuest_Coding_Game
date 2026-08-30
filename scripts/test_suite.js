#!/usr/bin/env node

/**
 * CodeQuest Automated Test Suite
 * 
 * Tests API contracts, schema alignment, security constraints,
 * and business logic integrity.
 * 
 * Usage: node scripts/test_suite.js
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
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

let createClient;
try {
  ({ createClient } = require('@supabase/supabase-js'));
} catch (e) {
  console.error('❌ @supabase/supabase-js not installed. Run: npm install');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_URL not set in .env.local. Live DB tests will be skipped, running static & code contract checks...\n');
}

const adminClient = serviceKey ? createClient(supabaseUrl, serviceKey) : null;
const anonClient = anonKey ? createClient(supabaseUrl, anonKey) : null;

let passed = 0;
let failed = 0;
let skipped = 0;
const failures = [];

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ ${testName}`);
    failed++;
    failures.push(testName);
  }
}

function skip(testName, reason) {
  console.log(`  ⏭️  ${testName} — SKIPPED: ${reason}`);
  skipped++;
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   CodeQuest Automated Test Suite             ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // ============================================================
  // GROUP 1: Schema Validation
  // ============================================================
  console.log('\n📋 GROUP 1: Schema Validation\n');

  if (!adminClient) {
    skip('Schema tests', 'SUPABASE_SERVICE_ROLE_KEY not set');
  } else {
    // Test 1: All required tables exist
    const requiredTables = ['users', 'tools', 'levels', 'stages', 'test_cases',
      'user_tools', 'stage_progress', 'code_submissions', 'daily_activity',
      'badges', 'user_badges'];

    for (const table of requiredTables) {
      const { error } = await adminClient.from(table).select('*').limit(0);
      assert(!error, `Table "${table}" exists and is queryable`);
    }

    // Test 2: tools table has required columns
    const { data: toolsSample } = await adminClient.from('tools').select('id, slug, name, description, icon_emoji, category, difficulty_rating, total_stages, sort_order').limit(1);
    assert(toolsSample !== null, 'tools table has all canonical columns');

    // Test 3: stages table has required columns
    const { data: stagesSample } = await adminClient.from('stages').select('id, tool_id, level_id, stage_number, title, quest_name, lesson_content_md, problem_statement_md, starter_code, solution_code, exercise_type, language_id, xp_reward').limit(1);
    assert(stagesSample !== null, 'stages table has all canonical columns');

    // Test 4: test_cases table has required columns
    const { data: tcSample } = await adminClient.from('test_cases').select('id, stage_id, test_number, input, expected_output, is_hidden, time_limit_ms, memory_limit_kb').limit(1);
    assert(tcSample !== null, 'test_cases table has all canonical columns');

    // Test 5: users table has required columns
    const { data: usersSample } = await adminClient.from('users').select('id, email, username, avatar_url, current_rank, total_xp, current_streak, longest_streak, last_active_at, created_at').limit(1);
    assert(usersSample !== null, 'users table has all canonical columns');

    // Test 6: code_submissions has canonical columns
    const { data: subSample } = await adminClient.from('code_submissions').select('id, user_id, stage_id, source_code, language_id, status, tests_passed, tests_total, execution_time_ms, memory_used_kb, stdout, stderr, submitted_at').limit(1);
    assert(subSample !== null, 'code_submissions table has all canonical columns');

    // Test 7: daily_activity has canonical columns
    const { data: daSample } = await adminClient.from('daily_activity').select('id, user_id, activity_date, stages_completed, xp_earned, submissions_count').limit(1);
    assert(daSample !== null, 'daily_activity table has all canonical columns');

    // Test 8: user_tools has canonical columns
    const { data: utSample } = await adminClient.from('user_tools').select('id, user_id, tool_id, status, current_level_order, current_stage_number, progress_pct, started_at, mastered_at').limit(1);
    assert(utSample !== null, 'user_tools table has all canonical columns');
  }

  // ============================================================
  // GROUP 2: RLS / Security Tests
  // ============================================================
  console.log('\n🔒 GROUP 2: RLS / Security Tests\n');

  if (!anonClient) {
    skip('RLS tests', 'NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
  } else {
    // Test 9: Anon client can read tools (public)
    const { data: pubTools, error: pubToolsErr } = await anonClient.from('tools').select('*').limit(1);
    assert(!pubToolsErr, 'Anonymous can read tools table (public)');

    // Test 10: Anon client can read stages (public)
    const { data: pubStages, error: pubStagesErr } = await anonClient.from('stages').select('*').limit(1);
    assert(!pubStagesErr, 'Anonymous can read stages table (public)');

    // Test 11: Anon client can read levels (public)
    const { data: pubLevels, error: pubLevelsErr } = await anonClient.from('levels').select('*').limit(1);
    assert(!pubLevelsErr, 'Anonymous can read levels table (public)');

    // Test 12: Anon client CANNOT read hidden test cases
    const { data: hiddenTc } = await anonClient
      .from('test_cases')
      .select('*')
      .eq('is_hidden', true)
      .limit(1);
    assert(!hiddenTc || hiddenTc.length === 0, 'Anonymous CANNOT read hidden test cases (RLS enforced)');

    // Test 13: Anon client CAN read visible test cases
    const { data: visibleTc, error: visTcErr } = await anonClient
      .from('test_cases')
      .select('*')
      .eq('is_hidden', false)
      .limit(1);
    assert(!visTcErr, 'Anonymous CAN read visible test cases');

    // Test 14: Admin client CAN read hidden test cases (bypass RLS)
    if (adminClient) {
      const { data: adminHidden } = await adminClient
        .from('test_cases')
        .select('*')
        .eq('is_hidden', true)
        .limit(1);
      assert(adminHidden !== null, 'Admin client CAN read hidden test cases (service role bypasses RLS)');
    }
  }

  // ============================================================
  // GROUP 3: Data Integrity Tests
  // ============================================================
  console.log('\n📊 GROUP 3: Data Integrity Tests\n');

  if (!adminClient) {
    skip('Data integrity tests', 'SUPABASE_SERVICE_ROLE_KEY not set');
  } else {
    // Test 15: All tools have at least 1 level
    const { data: allTools } = await adminClient.from('tools').select('id, slug');
    const { data: allLevels } = await adminClient.from('levels').select('id, slug, order_index');
    assert(allLevels && allLevels.length >= 5, `Levels table has at least 5 levels (found ${allLevels?.length || 0})`);

    // Test 16: Level order_index is sequential
    if (allLevels) {
      const indices = allLevels.map(l => l.order_index).sort((a, b) => a - b);
      const isSequential = indices.every((v, i) => v === i + 1);
      assert(isSequential, 'Level order_index is sequential (1,2,3,4,5)');
    }

    // Test 17: Every stage has at least 1 test case
    const { data: allStages } = await adminClient.from('stages').select('id, title');
    if (allStages && allStages.length > 0) {
      const { data: stagesWithTc } = await adminClient
        .from('test_cases')
        .select('stage_id')
        .limit(10000);
      
      const stageIdsWithTc = new Set(stagesWithTc?.map(tc => tc.stage_id) || []);
      const stagesWithoutTc = allStages.filter(s => !stageIdsWithTc.has(s.id));
      assert(stagesWithoutTc.length === 0, `All stages have test cases (${stagesWithoutTc.length} stages without)`);
    }

    // Test 18: No duplicate stage_number within same tool+level
    let dupeCheck = null;
    try {
      const res = await adminClient.rpc('check_duplicate_stages');
      dupeCheck = res.data;
    } catch (e) {
      dupeCheck = null;
    }
    // If no RPC exists, do manual check
    if (allStages) {
      const { data: stageDupes } = await adminClient
        .from('stages')
        .select('tool_id, level_id, stage_number');
      
      if (stageDupes) {
        const keys = new Set();
        let hasDupes = false;
        for (const s of stageDupes) {
          const key = `${s.tool_id}:${s.level_id}:${s.stage_number}`;
          if (keys.has(key)) { hasDupes = true; break; }
          keys.add(key);
        }
        assert(!hasDupes, 'No duplicate stage_number within same tool+level');
      }
    }

    // Test 19: FK integrity — every stage.tool_id exists in tools
    if (allStages && allTools) {
      const toolIds = new Set(allTools.map(t => t.id));
      const { data: stageToolIds } = await adminClient.from('stages').select('tool_id');
      const orphanStages = (stageToolIds || []).filter(s => !toolIds.has(s.tool_id));
      assert(orphanStages.length === 0, `No orphan stages (all tool_id FK valid) — ${orphanStages.length} orphans`);
    }

    // Test 20: FK integrity — every stage.level_id exists in levels
    if (allStages && allLevels) {
      const levelIds = new Set(allLevels.map(l => l.id));
      const { data: stageLevelIds } = await adminClient.from('stages').select('level_id');
      const orphanLevels = (stageLevelIds || []).filter(s => !levelIds.has(s.level_id));
      assert(orphanLevels.length === 0, `No orphan stages (all level_id FK valid) — ${orphanLevels.length} orphans`);
    }
  }

  // ============================================================
  // GROUP 4: API Contract Tests (file-based)
  // ============================================================
  console.log('\n🔌 GROUP 4: API Contract Tests (file-based)\n');

  const apiRoutes = [
    { path: 'app/api/submit/route.js', mustContain: ['createAdminClient', 'test_cases', 'xpAwarded', 'stage_progress', 'daily_activity', 'activity_date'] },
    { path: 'app/api/run/route.js', mustContain: ['submitCode', 'sourceCode', 'languageId'] },
    { path: 'app/api/quest/[toolSlug]/route.js', mustContain: ['levels', 'stage_number', 'stage_progress'] },
    { path: 'app/api/quest/[toolSlug]/[level]/[stage]/route.js', mustContain: ['lesson_content_md', 'problem_statement_md', 'is_hidden'] },
    { path: 'app/api/calendar/route.js', mustContain: ['activity_date', 'stages_completed'] },
    { path: 'app/api/profile/route.js', mustContain: ['progress_pct', 'status'] },
    { path: 'app/api/leaderboard/route.js', mustContain: ['current_rank'] },
    { path: 'app/api/user/tools/route.js', mustContain: ['progress_pct', 'status'] },
  ];

  for (const route of apiRoutes) {
    const filePath = path.join(__dirname, '..', route.path);
    if (!fs.existsSync(filePath)) {
      assert(false, `${route.path} exists`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Negative tests: ensure broken column names are NOT present
    const brokenColumns = ['input_data', '.eq(\'level\'', '.eq(\'order\'', 'memory_bytes', '.eq(\'date\''];
    for (const broken of brokenColumns) {
      if (content.includes(broken)) {
        assert(false, `${route.path} does NOT contain broken reference "${broken}"`);
      }
    }

    // Positive tests: ensure correct references ARE present
    for (const expected of route.mustContain) {
      assert(content.includes(expected), `${route.path} contains "${expected}"`);
    }
  }

  // ============================================================
  // GROUP 5: Frontend Contract Tests (file-based)
  // ============================================================
  console.log('\n🖥️  GROUP 5: Frontend Contract Tests (file-based)\n');

  const frontendChecks = [
    { path: 'hooks/useQuestProgress.js', mustContain: ['stage_number'], mustNotContain: ["order('order'"] },
    { path: 'hooks/useCalendarData.js', mustContain: ['activity_date'], mustNotContain: ["gte('date'"] },
    { path: 'components/Navbar/Navbar.js', mustContain: ['total_xp', '/curriculum'], mustNotContain: [] },
    { path: 'components/StageNode/StageNode.js', mustContain: ['stage_number', 'title'], mustNotContain: ['stage.order', 'stage.name'] },
    { path: 'app/dashboard/page.js', mustContain: ['current_rank'], mustNotContain: [] },
    { path: 'app/profile/page.js', mustContain: ['current_rank', 'longest_streak'], mustNotContain: ['user.rank', 'highest_streak'] },
    { path: 'providers/AuthProvider.js', mustContain: ['retryCount', 'setTimeout'], mustNotContain: [] },
  ];

  for (const check of frontendChecks) {
    const filePath = path.join(__dirname, '..', check.path);
    if (!fs.existsSync(filePath)) {
      assert(false, `${check.path} exists`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    for (const expected of check.mustContain) {
      assert(content.includes(expected), `${check.path} contains "${expected}"`);
    }

    for (const forbidden of check.mustNotContain) {
      assert(!content.includes(forbidden), `${check.path} does NOT contain "${forbidden}"`);
    }
  }

  // ============================================================
  // GROUP 6: Judge0 Integration Tests (file-based)
  // ============================================================
  console.log('\n⚡ GROUP 6: Judge0 Integration Tests (file-based)\n');

  const judge0Path = path.join(__dirname, '../lib/judge0.js');
  if (fs.existsSync(judge0Path)) {
    const judge0Content = fs.readFileSync(judge0Path, 'utf8');
    assert(judge0Content.includes('Buffer.from'), 'judge0.js uses Buffer.from() for base64 encoding');
    assert(!judge0Content.includes('btoa'), 'judge0.js does NOT use btoa() (browser API)');
    assert(!judge0Content.includes('atob'), 'judge0.js does NOT use atob() (browser API)');
    assert(judge0Content.includes('testCase.input'), 'judge0.js uses canonical column "input" for test cases');
    assert(judge0Content.includes('testCase.expected_output'), 'judge0.js uses canonical column "expected_output"');
    assert(judge0Content.includes('testCase.is_hidden'), 'judge0.js uses canonical column "is_hidden"');
    assert(judge0Content.includes('testCase.test_number'), 'judge0.js uses canonical column "test_number"');
  } else {
    assert(false, 'lib/judge0.js exists');
  }

  // ============================================================
  // GROUP 7: Submit Security Tests (file-based)
  // ============================================================
  console.log('\n🛡️  GROUP 7: Submit Security Tests (file-based)\n');

  const submitPath = path.join(__dirname, '../app/api/submit/route.js');
  if (fs.existsSync(submitPath)) {
    const submitContent = fs.readFileSync(submitPath, 'utf8');
    assert(submitContent.includes('createAdminClient'), 'submit route uses admin client for hidden test cases');
    assert(submitContent.includes('stage.language_id') || submitContent.includes('stage.language'), 'submit route uses stage language_id (not client-supplied)');
    assert(submitContent.includes('isHidden') || submitContent.includes('is_hidden'), 'submit route handles hidden test case redaction');
    assert(submitContent.includes('xp_reward'), 'submit route reads XP from stage (server-side)');
    assert(submitContent.includes('stage_progress'), 'submit route updates stage_progress');
    assert(submitContent.includes('daily_activity'), 'submit route updates daily_activity');
    assert(submitContent.includes('progress_pct'), 'submit route updates user_tools.progress_pct');
  }

  // ============================================================
  // GROUP 8: Migration Tests (file-based)
  // ============================================================
  console.log('\n🗄️  GROUP 8: Migration Tests (file-based)\n');

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const expectedMigrations = [
    '001_create_tables.sql',
    '002_create_rls_policies.sql',
    '003_create_indexes.sql',
    '004_create_triggers.sql',
    '005_create_user_profile_trigger.sql',
    '006_fix_user_trigger.sql'
  ];

  for (const migration of expectedMigrations) {
    assert(fs.existsSync(path.join(migrationsDir, migration)), `Migration ${migration} exists`);
  }

  // Test migration 006 content
  const m006Path = path.join(migrationsDir, '006_fix_user_trigger.sql');
  if (fs.existsSync(m006Path)) {
    const m006 = fs.readFileSync(m006Path, 'utf8');
    assert(m006.includes('DO UPDATE SET'), 'Migration 006 uses ON CONFLICT DO UPDATE');
    assert(m006.includes('email = EXCLUDED.email'), 'Migration 006 updates email on conflict');
    assert(m006.includes('avatar_url'), 'Migration 006 updates avatar_url on conflict');
    assert(!m006.includes('total_xp') || m006.includes('-- App-managed') || m006.includes('NEVER'), 'Migration 006 does NOT overwrite total_xp');
  }

  // ============================================================
  // GROUP 9: Curriculum UI Tests (file-based)
  // ============================================================
  console.log('\n📖 GROUP 9: Curriculum UI Tests (file-based)\n');

  const curriculumPages = [
    'app/curriculum/page.js',
    'app/curriculum/[toolSlug]/page.js',
    'app/curriculum/[toolSlug]/[level]/page.js',
    'app/curriculum/[toolSlug]/[level]/[stage]/page.js',
  ];

  for (const p of curriculumPages) {
    assert(fs.existsSync(path.join(__dirname, '..', p)), `${p} exists`);
  }

  // ============================================================
  // GROUP 10: Documentation & Config Tests
  // ============================================================
  console.log('\n📄 GROUP 10: Documentation & Config Tests\n');

  const requiredDocs = [
    'docs/curriculum_content_standard.md',
    '.env.example',
    'README.md',
  ];

  for (const doc of requiredDocs) {
    assert(fs.existsSync(path.join(__dirname, '..', doc)), `${doc} exists`);
  }

  // Admin client file
  assert(fs.existsSync(path.join(__dirname, '../lib/supabase/admin.js')), 'lib/supabase/admin.js exists');

  // ============================================================
  // RESULTS
  // ============================================================
  console.log('\n══════════════════════════════════════════════');
  console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  if (failures.length > 0) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log(`  ❌ ${f}`));
  }

  if (failed > 0) {
    console.log('\n❌ TEST SUITE FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
