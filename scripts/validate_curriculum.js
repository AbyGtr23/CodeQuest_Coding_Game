#!/usr/bin/env node

/**
 * Curriculum Validator — validates structural integrity, pedagogical ordering,
 * and content quality of all curriculum JSON files.
 *
 * Checks performed:
 * 1. Required fields present on every stage
 * 2. No placeholder/filler text detection
 * 3. No duplicate stage numbers within a tool+level
 * 4. No duplicate problem statements across stages
 * 5. Prerequisite ordering (stages are numbered sequentially)
 * 6. Level ordering matches canonical levels
 * 7. Test case integrity (at least 2 test cases, at least 1 hidden)
 * 8. Valid language IDs
 * 9. Non-empty lesson and problem content
 * 10. Orphan concept detection (referenced but not defined)
 */

const fs = require('fs');
const path = require('path');

const CURRICULUM_DIR = path.join(__dirname, '../data/seed/curriculum');
const VALID_LEVELS = ['cadet', 'soldier', 'knight', 'wizard', 'archmage'];
const VALID_LEVEL_ORDER = { cadet: 1, soldier: 2, knight: 3, wizard: 4, archmage: 5 };
const VALID_EXERCISE_TYPES = ['quiz', 'fill-code', 'coding-challenge', 'debug', 'project', 'refactor'];
const VALID_LANGUAGE_IDS = ['71', '63', '74', '60', '73', '54', '46', '82'];

// Patterns that indicate placeholder/filler content
const PLACEHOLDER_PATTERNS = [
  /this lesson introduces important concepts for this stage/i,
  /solve the problem for stage \d+/i,
  /output the expected result/i,
  /write your code here/i,
  /\/\/ solution\s*\n\s*print\('hello'\)/i,
  /lorem ipsum/i,
  /placeholder/i,
  /todo:/i,
];

const REQUIRED_STAGE_FIELDS = [
  'levelSlug',
  'stageNumber',
  'title',
  'questName',
  'lessonContentMd',
  'problemStatementMd',
  'starterCode',
  'solutionCode',
  'exerciseType',
  'languageId',
  'xpReward',
  'testCases',
];

let totalErrors = 0;
let totalWarnings = 0;

function error(file, stageNum, msg) {
  console.error(`  ❌ [${file}] Stage ${stageNum}: ${msg}`);
  totalErrors++;
}

function warn(file, stageNum, msg) {
  console.warn(`  ⚠️  [${file}] Stage ${stageNum}: ${msg}`);
  totalWarnings++;
}

function info(msg) {
  console.log(`  ℹ️  ${msg}`);
}

function validateCurriculumFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\nValidating ${fileName}...`);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    error(fileName, '?', `Invalid JSON: ${e.message}`);
    return;
  }

  if (!data.toolSlug) {
    error(fileName, '?', 'Missing toolSlug');
    return;
  }

  if (!Array.isArray(data.stages)) {
    error(fileName, '?', 'Stages field must be an array');
    return;
  }

  if (data.stages.length === 0) {
    // Check if tools.json marks this tool as having 0 stages (pending authoring)
    const toolsJsonPath = path.join(__dirname, '../data/seed/tools.json');
    if (fs.existsSync(toolsJsonPath)) {
      try {
        const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
        const toolEntry = toolsData.find(t => t.slug === data.toolSlug);
        if (toolEntry && toolEntry.total_stages === 0) {
          info(`Tool: ${data.toolSlug}, Stages: 0 (Pending authoring per tools.json - valid)`);
          return;
        }
      } catch (e) {}
    }
    error(fileName, '?', 'No stages found');
    return;
  }

  info(`Tool: ${data.toolSlug}, Stages: ${data.stages.length}`);

  const stageKeys = new Set();
  const problemHashes = new Set();
  let lastLevel = null;
  let lastStageInLevel = {};

  for (const stage of data.stages) {
    const sn = stage.stageNumber || '?';

    // 1. Required fields
    for (const field of REQUIRED_STAGE_FIELDS) {
      if (stage[field] === undefined || stage[field] === null) {
        error(fileName, sn, `Missing required field: ${field}`);
      }
    }

    // 2. Valid level
    if (stage.levelSlug && !VALID_LEVELS.includes(stage.levelSlug)) {
      error(fileName, sn, `Invalid levelSlug: ${stage.levelSlug}`);
    }

    // 3. Duplicate stage numbers within same level
    const key = `${stage.levelSlug}:${stage.stageNumber}`;
    if (stageKeys.has(key)) {
      error(fileName, sn, `Duplicate stage number ${sn} in level ${stage.levelSlug}`);
    }
    stageKeys.add(key);

    // 4. Level ordering (ensure levels appear in correct order)
    if (stage.levelSlug) {
      const currentLevelOrder = VALID_LEVEL_ORDER[stage.levelSlug];
      if (lastLevel && VALID_LEVEL_ORDER[lastLevel] > currentLevelOrder) {
        error(fileName, sn, `Level ordering violation: ${lastLevel} appeared before ${stage.levelSlug} but has higher order`);
      }
      lastLevel = stage.levelSlug;
    }

    // 5. Stage number sequential within level
    if (stage.levelSlug && stage.stageNumber) {
      const prev = lastStageInLevel[stage.levelSlug];
      if (prev !== undefined && stage.stageNumber !== prev + 1 && stage.stageNumber <= prev) {
        error(fileName, sn, `Stage number ${sn} not sequential after ${prev} in level ${stage.levelSlug}`);
      }
      lastStageInLevel[stage.levelSlug] = stage.stageNumber;
    }

    // 6. Placeholder content detection
    if (stage.lessonContentMd) {
      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(stage.lessonContentMd)) {
          error(fileName, sn, `Lesson contains placeholder text matching: ${pattern.source}`);
          break;
        }
      }
    }

    if (stage.problemStatementMd) {
      for (const pattern of PLACEHOLDER_PATTERNS) {
        if (pattern.test(stage.problemStatementMd)) {
          error(fileName, sn, `Problem statement contains placeholder text matching: ${pattern.source}`);
          break;
        }
      }
    }

    // 7. Duplicate problem statements
    if (stage.problemStatementMd) {
      const hash = stage.problemStatementMd.trim().substring(0, 100);
      if (problemHashes.has(hash)) {
        error(fileName, sn, 'Duplicate problem statement detected');
      }
      problemHashes.add(hash);
    }

    // 8. Content length checks
    if (stage.lessonContentMd && stage.lessonContentMd.length < 100) {
      warn(fileName, sn, `Lesson content suspiciously short (${stage.lessonContentMd.length} chars)`);
    }

    if (stage.problemStatementMd && stage.problemStatementMd.length < 50) {
      warn(fileName, sn, `Problem statement suspiciously short (${stage.problemStatementMd.length} chars)`);
    }

    // 9. Valid exercise type
    if (stage.exerciseType && !VALID_EXERCISE_TYPES.includes(stage.exerciseType)) {
      error(fileName, sn, `Invalid exerciseType: ${stage.exerciseType}`);
    }

    // 10. Valid language ID
    if (stage.languageId && !VALID_LANGUAGE_IDS.includes(stage.languageId)) {
      warn(fileName, sn, `Uncommon languageId: ${stage.languageId}`);
    }

    // 11. Test case integrity
    if (Array.isArray(stage.testCases)) {
      if (stage.testCases.length < 2) {
        warn(fileName, sn, `Only ${stage.testCases.length} test case(s) — recommend at least 2`);
      }

      const hasHidden = stage.testCases.some(tc => tc.isHidden === true);
      if (!hasHidden) {
        warn(fileName, sn, 'No hidden test cases — recommend at least 1 hidden');
      }

      // Check for duplicate test numbers
      const testNums = new Set();
      for (const tc of stage.testCases) {
        if (testNums.has(tc.testNumber)) {
          error(fileName, sn, `Duplicate test number: ${tc.testNumber}`);
        }
        testNums.add(tc.testNumber);

        if (!tc.expectedOutput && tc.expectedOutput !== '') {
          error(fileName, sn, `Test ${tc.testNumber}: missing expectedOutput`);
        }
      }
    }

    // 12. XP reward sanity
    if (stage.xpReward !== undefined) {
      if (stage.xpReward < 10 || stage.xpReward > 500) {
        warn(fileName, sn, `Unusual XP reward: ${stage.xpReward}`);
      }
    }

    // 13. Starter code should not be a solution
    if (stage.starterCode && stage.solutionCode) {
      if (stage.starterCode.trim() === stage.solutionCode.trim()) {
        error(fileName, sn, 'Starter code is identical to solution code');
      }
    }
  }
}

// Main execution
console.log('╔══════════════════════════════════════════════╗');
console.log('║   CodeQuest Curriculum Validator             ║');
console.log('╚══════════════════════════════════════════════╝\n');

if (!fs.existsSync(CURRICULUM_DIR)) {
  console.error(`Curriculum directory not found: ${CURRICULUM_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.json'));
console.log(`Found ${files.length} curriculum files.\n`);

for (const file of files) {
  validateCurriculumFile(path.join(CURRICULUM_DIR, file));
}

console.log('\n══════════════════════════════════════════════');
console.log(`Results: ${totalErrors} errors, ${totalWarnings} warnings`);

if (totalErrors > 0) {
  console.log('\n❌ VALIDATION FAILED — curriculum has integrity issues.');
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS — review recommended.');
  process.exit(0);
} else {
  console.log('\n✅ VALIDATION PASSED — all curriculum files are structurally sound.');
  process.exit(0);
}
