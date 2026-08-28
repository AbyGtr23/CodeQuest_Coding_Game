const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

const headers = JUDGE0_API_KEY
  ? {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    }
  : {
      'Content-Type': 'application/json',
    };

/**
 * Submit code to Judge0 for execution.
 * @param {string} sourceCode - The source code to execute.
 * @param {string} languageId - Judge0 language ID (e.g., "71" for Python).
 * @param {string} stdin - Standard input for the program.
 * @param {string} expectedOutput - Expected stdout (optional, for comparison).
 * @param {number} timeLimitMs - Time limit in milliseconds.
 * @param {number} memoryLimitKb - Memory limit in kilobytes.
 * @returns {Promise<Object>} Judge0 submission result.
 */
export async function submitCode({
  sourceCode,
  languageId,
  stdin = '',
  expectedOutput = '',
  timeLimitMs = 5000,
  memoryLimitKb = 128000,
}) {
  const payload = {
    source_code: btoa(unescape(encodeURIComponent(sourceCode))),
    language_id: parseInt(languageId),
    stdin: btoa(unescape(encodeURIComponent(stdin))),
    expected_output: expectedOutput
      ? btoa(unescape(encodeURIComponent(expectedOutput)))
      : undefined,
    cpu_time_limit: timeLimitMs / 1000,
    memory_limit: memoryLimitKb,
  };

  const response = await fetch(
    `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true&fields=*`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  return {
    status: mapStatus(result.status?.id),
    statusDescription: result.status?.description,
    stdout: result.stdout ? decodeURIComponent(escape(atob(result.stdout))) : '',
    stderr: result.stderr ? decodeURIComponent(escape(atob(result.stderr))) : '',
    compileOutput: result.compile_output
      ? decodeURIComponent(escape(atob(result.compile_output)))
      : '',
    time: parseFloat(result.time) || 0,
    memory: result.memory || 0,
    token: result.token,
  };
}

/**
 * Run code against multiple test cases.
 * @param {string} sourceCode
 * @param {string} languageId
 * @param {Array} testCases - Array of { input, expectedOutput, timeLimitMs, memoryLimitKb }
 * @returns {Promise<Object>} { results: [...], allPassed: boolean }
 */
export async function runTestCases(sourceCode, languageId, testCases) {
  const results = [];

  for (const testCase of testCases) {
    try {
      const result = await submitCode({
        sourceCode,
        languageId,
        stdin: testCase.input,
        expectedOutput: testCase.expectedOutput,
        timeLimitMs: testCase.timeLimitMs || 5000,
        memoryLimitKb: testCase.memoryLimitKb || 128000,
      });

      const actualOutput = result.stdout.trim();
      const expected = testCase.expectedOutput.trim();
      const passed = actualOutput === expected && result.status === 'accepted';

      results.push({
        testNumber: testCase.testNumber,
        passed,
        status: result.status,
        actualOutput,
        expectedOutput: expected,
        executionTime: result.time,
        memoryUsed: result.memory,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        isHidden: testCase.isHidden || false,
      });
    } catch (error) {
      results.push({
        testNumber: testCase.testNumber,
        passed: false,
        status: 'error',
        actualOutput: '',
        expectedOutput: testCase.expectedOutput,
        executionTime: 0,
        memoryUsed: 0,
        stderr: error.message,
        compileOutput: '',
        isHidden: testCase.isHidden || false,
      });
    }
  }

  return {
    results,
    allPassed: results.every((r) => r.passed),
    testsPassed: results.filter((r) => r.passed).length,
    testsTotal: results.length,
  };
}

function mapStatus(statusId) {
  const statusMap = {
    1: 'in_queue',
    2: 'processing',
    3: 'accepted',
    4: 'wrong_answer',
    5: 'time_limit',
    6: 'compilation_error',
    7: 'runtime_error_sigsegv',
    8: 'runtime_error_sigxfsz',
    9: 'runtime_error_sigfpe',
    10: 'runtime_error_sigabrt',
    11: 'runtime_error',
    12: 'runtime_error',
    13: 'internal_error',
    14: 'exec_format_error',
  };
  return statusMap[statusId] || 'unknown';
}
