const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Try to load .env.local if exists
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
    console.log("Starting seed...");
    const dir = path.join(__dirname, '../data/seed/curriculum');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    const { data: tools } = await supabase.from('tools').select('id, slug');
    const { data: levels } = await supabase.from('levels').select('id, slug');
    const toolMap = Object.fromEntries(tools.map(t => [t.slug, t.id]));
    const levelMap = Object.fromEntries(levels.map(l => [l.slug, l.id]));

    for (let file of files) {
        console.log(`Processing ${file}`);
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        const tool_id = toolMap[data.toolSlug];
        
        for (let stage of data.stages) {
            const level_id = levelMap[stage.levelSlug];
            const { data: insertedStage, error: stageErr } = await supabase.from('stages').insert({
                tool_id,
                level_id,
                stage_number: stage.stageNumber,
                title: stage.title,
                quest_name: stage.questName,
                lesson_content_md: stage.lessonContentMd,
                problem_statement_md: stage.problemStatementMd,
                starter_code: stage.starterCode,
                solution_code: stage.solutionCode,
                exercise_type: stage.exerciseType,
                language_id: stage.languageId,
                xp_reward: stage.xpReward
            }).select('id').single();

            if (stageErr) {
                console.error("Error inserting stage", stageErr);
                continue;
            }

            const testCases = stage.testCases.map(tc => ({
                stage_id: insertedStage.id,
                test_number: tc.testNumber,
                input: tc.input,
                expected_output: tc.expectedOutput,
                is_hidden: tc.isHidden,
                time_limit_ms: tc.timeLimitMs,
                memory_limit_kb: tc.memoryLimitKb
            }));
            
            await supabase.from('test_cases').insert(testCases);
        }
    }
    console.log("Seeding complete!");
}

seed();
