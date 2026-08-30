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

export async function submitCode({
  sourceCode,
  languageId,
  stdin = '',
  expectedOutput = '',
  timeLimitMs = 5000,
  memoryLimitKb = 128000,
}) {
  const payload = {
    source_code: Buffer.from(sourceCode, 'utf-8').toString('base64'),
    language_id: parseInt(languageId),
    stdin: Buffer.from(stdin, 'utf-8').toString('base64'),
    expected_output: expectedOutput
      ? Buffer.from(expectedOutput, 'utf-8').toString('base64')
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
    stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '',
    stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf-8') : '',
    compileOutput: result.compile_output
      ? Buffer.from(result.compile_output, 'base64').toString('utf-8')
      : '',
    time: parseFloat(result.time) || 0,
    memory: result.memory || 0,
    token: result.token,
  };
}

export async function runTestCases(sourceCode, languageId, testCases) {
  const results = [];

  for (const testCase of testCases) {
    try {
      const result = await submitCode({
        sourceCode,
        languageId,
        stdin: testCase.input || '',
        expectedOutput: testCase.expected_output || '',
        timeLimitMs: testCase.time_limit_ms || 5000,
        memoryLimitKb: testCase.memory_limit_kb || 128000,
      });

      const actualOutput = result.stdout.trim();
      const expected = (testCase.expected_output || '').trim();
      const passed = actualOutput === expected && result.status === 'accepted';

      results.push({
        testNumber: testCase.test_number,
        passed,
        status: result.status,
        actualOutput,
        expectedOutput: expected,
        executionTime: result.time,
        memoryUsed: result.memory,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        isHidden: testCase.is_hidden || false,
      });
    } catch (error) {
      results.push({
        testNumber: testCase.test_number,
        passed: false,
        status: 'error',
        actualOutput: '',
        expectedOutput: (testCase.expected_output || '').trim(),
        executionTime: 0,
        memoryUsed: 0,
        stderr: error.message,
        compileOutput: '',
        isHidden: testCase.is_hidden || false,
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
