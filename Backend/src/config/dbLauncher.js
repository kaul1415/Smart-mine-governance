const net = require('net');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile, execSync } = require('child_process');
const { Client } = require('pg');

const BACKEND_DIR = path.resolve(__dirname, '../..');
const PG_DATA_DIR = path.join(BACKEND_DIR, '.pgdata');

/**
 * Locate PostgreSQL native binaries across platforms (@embedded-postgres or system PATH)
 */
function findPostgresBinaries() {
  const isWindows = os.platform() === 'win32';
  const initDbName = isWindows ? 'initdb.exe' : 'initdb';
  const pgCtlName = isWindows ? 'pg_ctl.exe' : 'pg_ctl';

  // 1. Search in node_modules/@embedded-postgres/*
  const embeddedPostgresDir = path.join(BACKEND_DIR, 'node_modules', '@embedded-postgres');
  if (fs.existsSync(embeddedPostgresDir)) {
    const platformDirs = fs.readdirSync(embeddedPostgresDir);
    for (const pDir of platformDirs) {
      const binDir = path.join(embeddedPostgresDir, pDir, 'native', 'bin');
      const initDbPath = path.join(binDir, initDbName);
      const pgCtlPath = path.join(binDir, pgCtlName);
      if (fs.existsSync(initDbPath) && fs.existsSync(pgCtlPath)) {
        return { initdb: initDbPath, pg_ctl: pgCtlPath };
      }
    }
  }

  // 2. Fallback: check system PATH or common system directories
  try {
    const whichCmd = isWindows ? 'where' : 'which';
    const initdbSystem = execSync(`${whichCmd} ${initDbName}`, { stdio: 'pipe' }).toString().trim().split(/\r?\n/)[0];
    const pgCtlSystem = execSync(`${whichCmd} ${pgCtlName}`, { stdio: 'pipe' }).toString().trim().split(/\r?\n/)[0];
    if (initdbSystem && pgCtlSystem) {
      return { initdb: initdbSystem, pg_ctl: pgCtlSystem };
    }
  } catch (_e) {
    // Not found in system PATH
  }

  return null;
}

function isPortOpen(port = 5432, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function runExecutable(binPath, args) {
  return new Promise((resolve, reject) => {
    execFile(binPath, args, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`${binPath} failed: ${stderr || err.message}`));
      }
      resolve(stdout);
    });
  });
}

/**
 * Ensure PostgreSQL is running, coalgov_db exists, and tables/seed are bootstrapped if empty.
 */
async function ensurePostgresRunning() {
  const isOpen = await isPortOpen(5432);
  
  if (!isOpen) {
    console.log('🔄 PostgreSQL is not running on port 5432. Attempting to start local PostgreSQL cluster...');
    const bins = findPostgresBinaries();

    if (!bins) {
      console.warn(
        '⚠️ Could not automatically find PostgreSQL native binaries.\n' +
        '👉 Please ensure PostgreSQL is running via Docker (`docker compose up -d`) or your system PostgreSQL service.'
      );
      return;
    }

    if (!fs.existsSync(PG_DATA_DIR)) {
      console.log(`📁 Initializing new PostgreSQL data cluster at ${PG_DATA_DIR}...`);
      await runExecutable(bins.initdb, [
        '-D', PG_DATA_DIR,
        '-U', 'postgres',
        '--auth=trust',
        '--locale=C',
        '--encoding=UTF8',
      ]);
    }

    const logFile = path.join(PG_DATA_DIR, 'logfile');
    await runExecutable(bins.pg_ctl, [
      '-D', PG_DATA_DIR,
      '-l', logFile,
      'start',
    ]);

    // Wait for it to become ready
    let ready = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await isPortOpen(5432)) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      throw new Error('Timed out waiting for PostgreSQL to start on port 5432');
    }

    console.log('✅ PostgreSQL cluster started successfully on port 5432.');
  } else {
    console.log('✅ PostgreSQL is already running on port 5432.');
  }

  // Ensure coalgov_db database exists and password is set
  try {
    const adminClient = new Client({
      connectionString: 'postgresql://postgres@127.0.0.1:5432/postgres',
    });
    await adminClient.connect();
    const res = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = 'coalgov_db'");
    if (res.rowCount === 0) {
      console.log('📦 Creating database "coalgov_db"...');
      await adminClient.query('CREATE DATABASE coalgov_db');
      console.log('✅ Database "coalgov_db" created.');
    }
    try {
      await adminClient.query("ALTER USER postgres WITH PASSWORD 'postgres'");
    } catch (_e) {
      // User might already have password or permissions differ
    }
    await adminClient.end();
  } catch (err) {
    console.warn('⚠️ Notice during database check/creation:', err.message);
  }

  // Auto-bootstrap schema and seeds if the database is fresh / empty
  await autoBootstrapDatabase();
}

/**
 * Check if the database has tables; if empty, automatically push Prisma schema and run seed.
 */
async function autoBootstrapDatabase() {
  try {
    const dbClient = new Client({
      connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/coalgov_db',
    });
    await dbClient.connect();
    const tableRes = await dbClient.query(
      "SELECT COUNT(*)::int as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
    );
    const tableCount = tableRes.rows[0]?.count || 0;
    await dbClient.end();

    if (tableCount === 0) {
      console.log('📦 Empty database detected. Auto-bootstrapping Prisma schema and seed data...');
      execSync('npx prisma db push --skip-generate', { cwd: BACKEND_DIR, stdio: 'inherit' });
      execSync('node prisma/seed.js', { cwd: BACKEND_DIR, stdio: 'inherit' });
      console.log('🎉 Database schema created and fully seeded automatically!');
    }
  } catch (err) {
    console.warn('⚠️ Note during auto-bootstrap check:', err.message);
  }
}

module.exports = {
  ensurePostgresRunning,
  autoBootstrapDatabase,
  findPostgresBinaries,
};
