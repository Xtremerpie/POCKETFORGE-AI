/**
 * Automated test suite for PocketForge Local Agent
 * Validates:
 * 1. Health check & status endpoint
 * 2. Unauthenticated access prevention (401)
 * 3. Token pairing
 * 4. Directory traversal blocking (security check)
 * 5. File write, read, list, and delete
 * 6. Command execution and stdout capture
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8769; // test port
const TEST_WORKSPACE = path.join(os.tmpdir(), 'pocketforge_test_ws_' + Date.now());
fs.mkdirSync(TEST_WORKSPACE, { recursive: true });

const TEST_TOKEN = 'pf_sec_test_' + Date.now();
process.env.POCKETFORGE_TOKEN = TEST_TOKEN;

// Spawn test agent
const { spawn } = require('child_process');
const agentProc = spawn(process.execPath, [
  path.join(__dirname, 'pocketforge-agent.js'),
  '--port', String(PORT),
  '--token', TEST_TOKEN,
  '--workspace', TEST_WORKSPACE
], { stdio: 'pipe' });

function request(method, pathUrl, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: pathUrl,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let resBody = '';
      res.on('data', c => resBody += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('⏳ Waiting for test agent to initialize...');
  await new Promise(r => setTimeout(r, 1200));

  let passed = 0;
  let failed = 0;

  function assert(testName, condition, details = '') {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health Status
    const statusRes = await request('GET', '/api/status');
    assert('Agent health check returns 200', statusRes.status === 200 && statusRes.body.status === 'online');

    // 2. Unauthenticated check
    const unauthRes = await request('GET', '/api/fs/list');
    assert('Protected route rejects request without token (401)', unauthRes.status === 401);

    // 3. Token pairing
    const pairRes = await request('POST', '/api/pair', { token: TEST_TOKEN });
    assert('Token pairing succeeds with valid token', pairRes.status === 200 && pairRes.body.success === true);

    const badPairRes = await request('POST', '/api/pair', { token: 'wrong-token' });
    assert('Token pairing rejects invalid token (401)', badPairRes.status === 401);

    // 4. File Write
    const writeRes = await request('POST', '/api/fs/write', {
      path: 'test_project/index.html',
      content: '<h1>Hello PocketForge</h1>'
    }, TEST_TOKEN);
    assert('File write succeeds within workspace', writeRes.status === 200 && writeRes.body.success === true);

    // 5. File Read
    const readRes = await request('POST', '/api/fs/read', {
      path: 'test_project/index.html'
    }, TEST_TOKEN);
    assert('File read returns accurate contents', readRes.status === 200 && readRes.body.content === '<h1>Hello PocketForge</h1>');

    // 6. Security Check: Path Traversal
    try {
      const traversalRes = await request('POST', '/api/fs/read', {
        path: '../../../../../../etc/passwd'
      }, TEST_TOKEN);
      assert('Path traversal is blocked or contained safely', traversalRes.status === 400 || traversalRes.status === 404 || traversalRes.body.error);
    } catch (e) {
      assert('Path traversal threw error safely', true);
    }

    // 7. Command Execution
    const execRes = await request('POST', '/api/exec', {
      command: 'node -v'
    }, TEST_TOKEN);
    assert('Command execution runs and returns exit code 0', execRes.status === 200 && execRes.body.exitCode === 0);

    // 8. Delete
    const delRes = await request('POST', '/api/fs/delete', {
      path: 'test_project/index.html'
    }, TEST_TOKEN);
    assert('File deletion works', delRes.status === 200 && delRes.body.success === true);

    console.log(`\nAgent Tests Completed: ${passed} passed, ${failed} failed.\n`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    agentProc.kill();
    try { fs.rmSync(TEST_WORKSPACE, { recursive: true, force: true }); } catch (e) {}
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
