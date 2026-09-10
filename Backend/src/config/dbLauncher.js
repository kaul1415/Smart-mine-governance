const net = require('net');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { Client } = require('pg');

const BACKEND_DIR = path.resolve(__dirname, '../..');
const PG_DATA_DIR = path.join(BACKEND_DIR, '.pgdata');
const NATIVE_BIN_DIR = path.join(
  BACKEND_DIR,
  'node_modules/@embedded-postgres/linux-x64/native/bin'
);

const PG_CTL_BIN = path.join(NATIVE_BIN_DIR, 'pg_ctl');
const INITDB_BIN = path.join(NATIVE_BIN_DIR, 'initdb');

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

async function ensurePostgresRunning() {
  const isOpen = await isPortOpen(5432);
  if (isOpen) {
    console.log('✅ PostgreSQL is already running on port 5432.');
    return;
  }

  console.log('🔄 PostgreSQL is not running. Starting local PostgreSQL cluster...');

  if (!fs.existsSync(PG_DATA_DIR)) {
    console.log(`📁 Initializing new PostgreSQL data cluster at ${PG_DATA_DIR}...`);
    if (!fs.existsSync(INITDB_BIN)) {
      throw new Error(`initdb binary not found at ${INITDB_BIN}`);
    }
    await runExecutable(INITDB_BIN, [
      '-D', PG_DATA_DIR,
      '-U', 'postgres',
      '--auth=trust',
      '--locale=C',
      '--encoding=UTF8'
    ]);
  }

  if (!fs.existsSync(PG_CTL_BIN)) {
    throw new Error(`pg_ctl binary not found at ${PG_CTL_BIN}`);
  }

  const logFile = path.join(PG_DATA_DIR, 'logfile');
  await runExecutable(PG_CTL_BIN, [
    '-D', PG_DATA_DIR,
    '-l', logFile,
    'start'
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

  console.log('✅ PostgreSQL started successfully on port 5432.');

  // Ensure coalgov_db exists
  try {
    const client = new Client({
      connectionString: 'postgresql://postgres@127.0.0.1:5432/postgres'
    });
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'coalgov_db'");
    if (res.rowCount === 0) {
      console.log('📦 Creating database "coalgov_db"...');
      await client.query('CREATE DATABASE coalgov_db');
      console.log('✅ Database "coalgov_db" created.');
    }
    await client.query("ALTER USER postgres WITH PASSWORD 'postgres'");
    await client.end();
  } catch (err) {
    console.warn('⚠️ Warning checking/creating coalgov_db:', err.message);
  }
}

module.exports = {
  ensurePostgresRunning,
};
