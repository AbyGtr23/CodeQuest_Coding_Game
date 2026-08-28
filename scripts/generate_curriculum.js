const fs = require('fs');
const path = require('path');

const curriculumDir = path.join(__dirname, '../data/seed/curriculum');
fs.mkdirSync(curriculumDir, { recursive: true });

function generateStages(toolSlug, full, languageId) {
    const curriculum = { toolSlug, stages: [] };
    const levelPlan = [
        { slug: 'cadet', count: 15 },
        { slug: 'soldier', count: 15 },
        { slug: 'knight', count: 15 },
        { slug: 'wizard', count: 12 },
        { slug: 'archmage', count: 10 }
    ];
    let stageNumber = 1;
    for (let lvl of levelPlan) {
        let count = full ? lvl.count : (lvl.slug === 'cadet' ? lvl.count : 0);
        for (let i = 1; i <= count; i++) {
            let title = `${toolSlug.toUpperCase()} Stage ${stageNumber}`;
            let textFiller = "This lesson introduces important concepts for this stage. ".repeat(20);
            curriculum.stages.push({
                levelSlug: lvl.slug,
                stageNumber: stageNumber,
                title: title,
                questName: `Quest ${stageNumber}`,
                lessonContentMd: `## ${title}\n\n${textFiller}\n\n\`\`\`\n// example\n\`\`\``,
                problemStatementMd: `Solve the problem for stage ${stageNumber}. Output the expected result.`,
                starterCode: `// Write your code here\n`,
                solutionCode: `// Solution\nprint('Hello')`,
                exerciseType: "coding-challenge",
                languageId: languageId,
                xpReward: 50,
                testCases: [
                    { testNumber: 1, input: "1", expectedOutput: "1", isHidden: false, timeLimitMs: 5000, memoryLimitKb: 128000 },
                    { testNumber: 2, input: "2", expectedOutput: "2", isHidden: false, timeLimitMs: 5000, memoryLimitKb: 128000 },
                    { testNumber: 3, input: "3", expectedOutput: "3", isHidden: true, timeLimitMs: 5000, memoryLimitKb: 128000 }
                ]
            });
            stageNumber++;
        }
        if (!full && lvl.slug === 'cadet') break; // stub only cadet
    }
    const targetFile = path.join(curriculumDir, `${toolSlug}.json`);
    fs.writeFileSync(targetFile, JSON.stringify(curriculum, null, 2));
    console.log(`Wrote ${targetFile}`);
}

generateStages('python', true, '71');
generateStages('javascript', true, '63');
generateStages('git', true, '46');

['typescript', 'go', 'rust', 'docker', 'linux-cli', 'sql', 'react', 'nodejs', 'django'].forEach(t => {
    generateStages(t, false, '63'); // placeholder lang ID for stubs
});
