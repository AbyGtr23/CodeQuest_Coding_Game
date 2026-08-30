const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local if it exists
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

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase env vars. Please provide NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   CodeQuest Curriculum Seeder (Idempotent)   ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    const dir = path.join(__dirname, '../data/seed/curriculum');
    if (!fs.existsSync(dir)) {
        console.error(`❌ Curriculum directory not found: ${dir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} curriculum files.\n`);

    // Load lookup tables
    const { data: tools, error: toolErr } = await supabase.from('tools').select('id, slug');
    if (toolErr) { console.error("❌ Failed to load tools:", toolErr.message); process.exit(1); }
    
    const { data: levels, error: levelErr } = await supabase.from('levels').select('id, slug');
    if (levelErr) { console.error("❌ Failed to load levels:", levelErr.message); process.exit(1); }

    const toolMap = Object.fromEntries(tools.map(t => [t.slug, t.id]));
    const levelMap = Object.fromEntries(levels.map(l => [l.slug, l.id]));

    let totalStages = 0;
    let totalTestCases = 0;
    let skippedTools = 0;
    let errors = 0;

    for (const file of files) {
        console.log(`\n📂 Processing ${file}...`);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        } catch (e) {
            console.error(`  ❌ Invalid JSON in ${file}: ${e.message}`);
            errors++;
            continue;
        }

        const tool_id = toolMap[data.toolSlug];
        if (!tool_id) {
            console.warn(`  ⚠️  Tool "${data.toolSlug}" not found in tools table. Skipping.`);
            skippedTools++;
            continue;
        }

        let fileStages = 0;
        let fileTestCases = 0;

        for (const stage of data.stages) {
            const level_id = levelMap[stage.levelSlug];
            if (!level_id) {
                console.warn(`  ⚠️  Level "${stage.levelSlug}" not found. Skipping stage ${stage.stageNumber}.`);
                errors++;
                continue;
            }

            // Upsert stage (idempotent — ON CONFLICT tool_id, level_id, stage_number)
            const { data: upsertedStage, error: stageErr } = await supabase
                .from('stages')
                .upsert({
                    tool_id,
                    level_id,
                    stage_number: stage.stageNumber,
                    title: stage.title,
                    quest_name: stage.questName || stage.title,
                    lesson_content_md: stage.lessonContentMd || '',
                    problem_statement_md: stage.problemStatementMd || '',
                    starter_code: stage.starterCode || '',
                    solution_code: stage.solutionCode || '',
                    exercise_type: stage.exerciseType || 'coding-challenge',
                    language_id: stage.languageId || '71',
                    xp_reward: stage.xpReward || 30
                }, { onConflict: 'tool_id, level_id, stage_number' })
                .select('id')
                .single();

            if (stageErr) {
                console.error(`  ❌ Stage ${stage.stageNumber} upsert error: ${stageErr.message}`);
                errors++;
                continue;
            }

            fileStages++;
            totalStages++;

            // Upsert test cases (idempotent — ON CONFLICT stage_id, test_number)
            if (Array.isArray(stage.testCases) && stage.testCases.length > 0) {
                for (const tc of stage.testCases) {
                    const { error: tcErr } = await supabase
                        .from('test_cases')
                        .upsert({
                            stage_id: upsertedStage.id,
                            test_number: tc.testNumber,
                            input: tc.input || '',
                            expected_output: tc.expectedOutput || '',
                            is_hidden: tc.isHidden || false,
                            time_limit_ms: tc.timeLimitMs || 5000,
                            memory_limit_kb: tc.memoryLimitKb || 128000
                        }, { onConflict: 'stage_id, test_number' });

                    if (tcErr) {
                        console.error(`  ❌ Test case ${tc.testNumber} error: ${tcErr.message}`);
                        errors++;
                    } else {
                        fileTestCases++;
                        totalTestCases++;
                    }
                }
            }
        }

        console.log(`  ✅ ${fileStages} stages, ${fileTestCases} test cases`);
    }

    console.log('\n══════════════════════════════════════════════');
    console.log(`Results: ${totalStages} stages, ${totalTestCases} test cases seeded`);
    if (skippedTools > 0) console.log(`  ⚠️  ${skippedTools} tool(s) skipped (not in tools table)`);
    if (errors > 0) {
        console.log(`  ❌ ${errors} error(s) encountered`);
        process.exit(1);
    } else {
        console.log('\n✅ Seeding completed successfully!');
    }
}

seed().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
