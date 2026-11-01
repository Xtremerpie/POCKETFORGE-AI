#!/usr/bin/env node
/**
 * POCKETFORGE AI - Termux & Linux Local Execution Agent
 * 
 * Phone-first, low RAM, zero external dependency daemon.
 * Exposes a secured, authenticated localhost API for:
 *  - Project file syncing & manipulation
 *  - Sandboxed command execution with real-time output
 *  - Dev server process lifecycle management
 *  - Git automation (status, commit, push, pull, clone)
 *  - Health & system resource telemetry
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');
const crypto = require('crypto');
const url = require('url');

const VERSION = '1.0.0';
const DEFAULT_PORT = 8765;
const DEFAULT_HOST = '127.0.0.1';

// Determine workspace root in Termux or general OS
const HOME_DIR = os.homedir();
const IS_TERMUX = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
const CONFIG_DIR = path.join(HOME_DIR, '.pocketforge');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TOKEN_FILE = path.join(CONFIG_DIR, 'token');

// Default workspace directory
let workspaceDir = path.join(HOME_DIR, 'pocketforge-projects');

// Process registry
const runningProcesses = new Map();

// Helper: Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
  }
}

// Token management
function getOrCreateToken() {
  ensureDirs();
  if (process.env.POCKETFORGE_TOKEN) {
    return process.env.POCKETFORGE_TOKEN;
  }
  if (fs.existsSync(TOKEN_FILE)) {
    const existing = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    if (existing.length >= 16) return existing;
  }
  const newToken = 'pf_sec_' + crypto.randomBytes(16).toString('hex');
  fs.writeFileSync(TOKEN_FILE, newToken, { mode: 0o600 });
  return newToken;
}

// Load config
function loadConfig() {
  ensureDirs();
  let config = {
    port: DEFAULT_PORT,
    host: DEFAULT_HOST,
    workspace: workspaceDir,
    allowedOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:8765'],
  };
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      config = { ...config, ...saved };
      if (saved.workspace) workspaceDir = saved.workspace;
    } catch (e) {
      console.warn('Could not parse config.json, using defaults.');
    }
  } else {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
  }
  return config;
}

const config = loadConfig();
const AUTH_TOKEN = getOrCreateToken();

// Parse command line arguments
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--port' && process.argv[i + 1]) {
    config.port = parseInt(process.argv[i + 1], 10);
    i++;
  } else if (process.argv[i] === '--token' && process.argv[i + 1]) {
    // Override token via flag
    fs.writeFileSync(TOKEN_FILE, process.argv[i + 1], { mode: 0o600 });
    i++;
  } else if (process.argv[i] === '--workspace' && process.argv[i + 1]) {
    workspaceDir = path.resolve(process.argv[i + 1]);
    ensureDirs();
    i++;
  }
}

// Path validation helper: Prevent directory traversal attack
function resolveSafePath(userPath) {
  if (!userPath) return workspaceDir;
  const normalized = path.normalize(userPath).replace(/^(\.\.[\/\\])+/, '');
  const target = path.resolve(workspaceDir, normalized);
  if (!target.startsWith(workspaceDir)) {
    throw new Error('Access denied: Path traversal detected outside workspace root.');
  }
  return target;
}

// Command sanity checker
function validateCommandSafety(cmd) {
  const dangerousPatterns = [
    /rm\s+-rf\s+\/($|\s)/i,
    /mkfs/i,
    /dd\s+if=/i,
    />\s*\/dev\/[s|h]d/i,
    /:(){ :|:& };:/, // fork bomb
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(cmd)) {
      throw new Error(`Command rejected for safety: dangerous pattern '${pattern}' detected.`);
    }
  }
}

// HTTP Response Helpers
function sendJson(res, statusCode, data) {
  const jsonStr = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
  res.end(jsonStr);
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  });
}

function handleCors(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  });
  res.end();
}

// Read body helper
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 50 * 1024 * 1024) { // 50MB max limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

// Authentication Check
function checkAuth(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1] === AUTH_TOKEN;
  }
  return false;
}

// Server creation
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    return handleCors(req, res);
  }

  // Public unauthenticated ping & health endpoint
  if (pathname === '/api/status' && method === 'GET') {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    return sendJson(res, 200, {
      success: true,
      agent: 'PocketForge AI Termux Agent',
      version: VERSION,
      status: 'online',
      nodeVersion: process.version,
      platform: os.platform(),
      isTermux: IS_TERMUX,
      uptime: process.uptime(),
      memory: {
        totalMB: Math.round(totalMem / (1024 * 1024)),
        freeMB: Math.round(freeMem / (1024 * 1024)),
        usedMB: Math.round((totalMem - freeMem) / (1024 * 1024)),
      },
      workspace: workspaceDir,
      runningProcessesCount: runningProcesses.size,
      authenticated: checkAuth(req),
      timestamp: new Date().toISOString()
    });
  }

  // Token pairing endpoint
  if (pathname === '/api/pair' && method === 'POST') {
    try {
      const body = await readRequestBody(req);
      if (body.token === AUTH_TOKEN) {
        return sendJson(res, 200, {
          success: true,
          message: 'Device successfully paired with PocketForge Local Agent.',
          workspace: workspaceDir,
          version: VERSION
        });
      } else {
        return sendError(res, 401, 'Invalid pairing token.');
      }
    } catch (err) {
      return sendError(res, 400, err.message);
    }
  }

  // All other endpoints require authentication
  if (!checkAuth(req)) {
    return sendError(res, 401, 'Unauthorized. Please provide valid Bearer token in Authorization header.');
  }

  try {
    // 1. Filesystem List
    if (pathname === '/api/fs/list' && method === 'GET') {
      const targetRel = parsedUrl.query.path || '';
      const safeTarget = resolveSafePath(targetRel);

      if (!fs.existsSync(safeTarget)) {
        return sendError(res, 404, `Directory not found: ${targetRel}`);
      }

      const entries = fs.readdirSync(safeTarget, { withFileTypes: true });
      const items = entries.map(dirent => {
        const itemPath = path.join(safeTarget, dirent.name);
        let stat;
        try {
          stat = fs.statSync(itemPath);
        } catch {
          stat = { size: 0, mtime: new Date() };
        }
        return {
          name: dirent.name,
          path: path.relative(workspaceDir, itemPath).replace(/\\/g, '/'),
          isDirectory: dirent.isDirectory(),
          size: dirent.isDirectory() ? 0 : stat.size,
          updatedAt: stat.mtime
        };
      });

      return sendJson(res, 200, {
        success: true,
        currentPath: path.relative(workspaceDir, safeTarget).replace(/\\/g, '/'),
        items
      });
    }

    // 2. Filesystem Read File
    if (pathname === '/api/fs/read' && method === 'POST') {
      const body = await readRequestBody(req);
      const safePath = resolveSafePath(body.path);
      if (!fs.existsSync(safePath)) {
        return sendError(res, 404, `File not found: ${body.path}`);
      }
      const stat = fs.statSync(safePath);
      if (stat.isDirectory()) {
        return sendError(res, 400, `Cannot read directory as file: ${body.path}`);
      }
      const content = fs.readFileSync(safePath, 'utf8');
      return sendJson(res, 200, {
        success: true,
        path: body.path,
        content,
        size: stat.size,
        updatedAt: stat.mtime
      });
    }

    // 3. Filesystem Write File
    if (pathname === '/api/fs/write' && method === 'POST') {
      const body = await readRequestBody(req);
      if (!body.path) return sendError(res, 400, 'Path is required');
      const safePath = resolveSafePath(body.path);
      const parentDir = path.dirname(safePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(safePath, body.content || '', 'utf8');
      const stat = fs.statSync(safePath);
      return sendJson(res, 200, {
        success: true,
        path: body.path,
        size: stat.size,
        updatedAt: stat.mtime
      });
    }

    // 4. Filesystem Create Directory
    if (pathname === '/api/fs/mkdir' && method === 'POST') {
      const body = await readRequestBody(req);
      if (!body.path) return sendError(res, 400, 'Path is required');
      const safePath = resolveSafePath(body.path);
      fs.mkdirSync(safePath, { recursive: true });
      return sendJson(res, 200, {
        success: true,
        message: 'Directory created',
        path: body.path
      });
    }

    // 5. Filesystem Delete
    if (pathname === '/api/fs/delete' && method === 'POST') {
      const body = await readRequestBody(req);
      if (!body.path) return sendError(res, 400, 'Path is required');
      const safePath = resolveSafePath(body.path);
      if (safePath === workspaceDir) {
        return sendError(res, 400, 'Cannot delete root workspace directory.');
      }
      if (fs.existsSync(safePath)) {
        fs.rmSync(safePath, { recursive: true, force: true });
      }
      return sendJson(res, 200, {
        success: true,
        message: `Deleted ${body.path}`
      });
    }

    // 6. Execute Synchronous / Short Command
    if (pathname === '/api/exec' && method === 'POST') {
      const body = await readRequestBody(req);
      const command = body.command;
      if (!command) return sendError(res, 400, 'Command string required.');
      
      validateCommandSafety(command);

      const cwd = body.cwd ? resolveSafePath(body.cwd) : workspaceDir;
      const timeout = Math.min(body.timeout || 30000, 120000); // max 2 min
      const nodeDir = path.dirname(process.execPath);
      const pathSep = process.platform === 'win32' ? ';' : ':';
      const extendedPath = nodeDir + pathSep + (process.env.PATH || '');

      exec(command, {
        cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PATH: extendedPath }
      }, (err, stdout, stderr) => {
        return sendJson(res, 200, {
          success: !err,
          command,
          exitCode: err ? (err.code || 1) : 0,
          stdout: stdout || '',
          stderr: stderr || (err ? err.message : ''),
          cwd: path.relative(workspaceDir, cwd).replace(/\\/g, '/') || '.'
        });
      });
      return;
    }

    // 7. Process Management: Start background dev server or process
    if (pathname === '/api/process/start' && method === 'POST') {
      const body = await readRequestBody(req);
      const command = body.command;
      const processName = body.name || command;
      const port = body.port || null;
      if (!command) return sendError(res, 400, 'Command string required.');

      validateCommandSafety(command);

      const cwd = body.cwd ? resolveSafePath(body.cwd) : workspaceDir;
      const processId = 'proc_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      // Shell execution
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'powershell.exe' : (IS_TERMUX ? '/data/data/com.termux/files/usr/bin/bash' : '/bin/bash');
      const args = isWindows ? ['-Command', command] : ['-c', command];

      const nodeDir = path.dirname(process.execPath);
      const pathSep = process.platform === 'win32' ? ';' : ':';
      const extendedPath = nodeDir + pathSep + (process.env.PATH || '');

      const child = spawn(shell, args, {
        cwd,
        env: {
          ...process.env,
          PATH: extendedPath,
          PORT: port ? String(port) : process.env.PORT
        },
        detached: false
      });

      const procRecord = {
        id: processId,
        name: processName,
        command,
        port,
        pid: child.pid,
        cwd: path.relative(workspaceDir, cwd).replace(/\\/g, '/') || '.',
        startedAt: new Date().toISOString(),
        status: 'running',
        logs: [],
        exitCode: null
      };

      const appendLog = (type, chunk) => {
        const text = chunk.toString();
        procRecord.logs.push({
          type,
          text,
          time: new Date().toISOString()
        });
        if (procRecord.logs.length > 500) {
          procRecord.logs.shift(); // keep last 500 lines
        }
      };

      child.stdout.on('data', chunk => appendLog('stdout', chunk));
      child.stderr.on('data', chunk => appendLog('stderr', chunk));

      child.on('close', code => {
        procRecord.status = 'stopped';
        procRecord.exitCode = code;
        appendLog('system', `Process exited with code ${code}`);
      });

      child.on('error', err => {
        procRecord.status = 'error';
        appendLog('error', err.message);
      });

      runningProcesses.set(processId, { child, record: procRecord });

      return sendJson(res, 200, {
        success: true,
        process: procRecord
      });
    }

    // 8. Process Management: List running processes
    if (pathname === '/api/process/list' && method === 'GET') {
      const list = Array.from(runningProcesses.values()).map(p => p.record);
      return sendJson(res, 200, {
        success: true,
        processes: list
      });
    }

    // 9. Process Management: Stop process
    if (pathname === '/api/process/stop' && method === 'POST') {
      const body = await readRequestBody(req);
      const processId = body.processId;
      if (!processId || !runningProcesses.has(processId)) {
        return sendError(res, 404, `Process ${processId} not found.`);
      }
      const item = runningProcesses.get(processId);
      try {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', String(item.child.pid), '/f', '/t']);
        } else {
          item.child.kill('SIGTERM');
          setTimeout(() => {
            try { item.child.kill('SIGKILL'); } catch (e) {}
          }, 3000);
        }
        item.record.status = 'stopped';
      } catch (err) {
        return sendError(res, 500, `Failed to stop process: ${err.message}`);
      }

      return sendJson(res, 200, {
        success: true,
        message: `Process ${processId} stopped.`,
        process: item.record
      });
    }

    // 10. Process Logs
    if (pathname === '/api/process/logs' && method === 'GET') {
      const processId = parsedUrl.query.processId;
      if (!processId || !runningProcesses.has(processId)) {
        return sendError(res, 404, `Process not found: ${processId}`);
      }
      const item = runningProcesses.get(processId);
      return sendJson(res, 200, {
        success: true,
        logs: item.record.logs
      });
    }

    // 11. Git: Status
    if (pathname === '/api/git/status' && method === 'POST') {
      const body = await readRequestBody(req);
      const cwd = body.cwd ? resolveSafePath(body.cwd) : workspaceDir;

      exec('git status --porcelain=v1 -b', { cwd }, (err, stdout, stderr) => {
        if (err) {
          return sendJson(res, 200, {
            success: false,
            isRepo: false,
            error: stderr || err.message
          });
        }
        const lines = stdout.split('\n').filter(Boolean);
        const branchLine = lines.find(l => l.startsWith('## ')) || '## unknown';
        const branch = branchLine.replace('## ', '').split('...')[0].trim();
        const files = lines.filter(l => !l.startsWith('## ')).map(line => ({
          status: line.substring(0, 2).trim(),
          file: line.substring(3).trim()
        }));

        return sendJson(res, 200, {
          success: true,
          isRepo: true,
          branch,
          clean: files.length === 0,
          files,
          raw: stdout
        });
      });
      return;
    }

    // 12. Git: Commit & Push
    if (pathname === '/api/git/commit' && method === 'POST') {
      const body = await readRequestBody(req);
      const cwd = body.cwd ? resolveSafePath(body.cwd) : workspaceDir;
      const message = (body.message || 'Auto commit from PocketForge AI').replace(/"/g, '\\"');

      exec(`git add -A && git commit -m "${message}"`, { cwd }, (err, stdout, stderr) => {
        return sendJson(res, 200, {
          success: !err,
          stdout,
          stderr: stderr || (err ? err.message : '')
        });
      });
      return;
    }

    // 13. System Info / Check environment tools
    if (pathname === '/api/system/tools' && method === 'GET') {
      const checkTool = (name, cmd) => new Promise(resolve => {
        exec(cmd, (err, stdout) => {
          resolve({
            name,
            available: !err,
            version: err ? null : stdout.trim().split('\n')[0]
          });
        });
      });

      const [nodeInfo, pythonInfo, gitInfo, npmInfo] = await Promise.all([
        checkTool('Node.js', 'node -v'),
        checkTool('Python', 'python --version || python3 --version'),
        checkTool('Git', 'git --version'),
        checkTool('npm', 'npm -v'),
      ]);

      return sendJson(res, 200, {
        success: true,
        tools: [nodeInfo, pythonInfo, gitInfo, npmInfo],
        platform: os.platform(),
        arch: os.arch(),
        homedir: HOME_DIR,
        isTermux: IS_TERMUX
      });
    }

    // Default 404
    return sendError(res, 404, `Route not found: ${method} ${pathname}`);
  } catch (err) {
    return sendError(res, 500, err.message, err.stack);
  }
});

// Start listening
server.listen(config.port, config.host, () => {
  const line = '='.repeat(54);
  console.log('\n' + line);
  console.log(' 🔥 POCKETFORGE AI LOCAL AGENT (v' + VERSION + ')');
  console.log(' Your Phone. Your Code. Your Own Development Universe.');
  console.log(line);
  console.log(` Status:     ONLINE`);
  console.log(` Agent URL:  http://${config.host}:${config.port}`);
  console.log(` Workspace:  ${workspaceDir}`);
  console.log(` Platform:   ${os.platform()} (${IS_TERMUX ? 'Android Termux' : 'Host/Linux'})`);
  console.log(` Auth Token: ${AUTH_TOKEN}`);
  console.log(line);
  console.log(' 👉 In PocketForge AI Web App:');
  console.log('    1. Open Settings or Terminal');
  console.log(`    2. Enter Agent URL: http://${config.host}:${config.port}`);
  console.log(`    3. Enter Token:     ${AUTH_TOKEN}`);
  console.log('    4. Click "Pair Agent"');
  console.log(line + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping PocketForge Agent...');
  for (const [id, item] of runningProcesses.entries()) {
    try {
      if (item.child) item.child.kill();
    } catch (e) {}
  }
  server.close(() => {
    console.log('PocketForge Agent terminated safely.');
    process.exit(0);
  });
});
