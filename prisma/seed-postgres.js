const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { GENESIS_PREVIOUS_HASH, calculateHash } = require('../src/utils/blockchain');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CoalGov PostgreSQL Database & Blockchain Seed...');

  // 1. Clean existing records (Optional safety check)
  await prisma.auditLog.deleteMany();
  await prisma.correctiveAction.deleteMany();
  await prisma.violation.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.statutoryCompliance.deleteMany();
  await prisma.mine.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Password Hash
  const passwordHash = await bcrypt.hash('CoalGov@2026', 10);

  // 3. Create Key System Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Sharma',
      email: 'admin@coalgov.gov.in',
      password: passwordHash,
      role: 'ADMIN',
      designation: 'Chief Governance Officer',
      mineName: 'Corporate Headquarters - New Delhi',
    },
  });

  const inspectorUser = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      email: 'inspector.singh@dgms.gov.in',
      password: passwordHash,
      role: 'INSPECTOR',
      designation: 'Directorate General of Mines Safety (DGMS) Inspector',
      phone: '+91 9876543210',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: 'Anil Kumar',
      email: 'manager.ccl@coalgov.in',
      password: passwordHash,
      role: 'MANAGER',
      designation: 'General Manager - Piparwar Area',
      mineName: 'Piparwar Opencast Mine',
    },
  });

  const officialUser = await prisma.user.create({
    data: {
      name: 'Suresh Prasad',
      email: 'official.ecl@coalgov.in',
      password: passwordHash,
      role: 'MINE_OFFICIAL',
      designation: 'Safety & Compliance Officer',
      mineName: 'Rajmahal OCP',
    },
  });

  console.log('✅ Seeded 4 Core Users (ADMIN, INSPECTOR, MANAGER, MINE_OFFICIAL)');

  // 4. Create Key Coal Mines
  const mine1 = await prisma.mine.create({
    data: {
      code: 'MINE-JH-ECL-001',
      name: 'Rajmahal Opencast Mine',
      subsidiary: 'ECL',
      state: 'Jharkhand',
      district: 'Godda',
      latitude: 25.0489,
      longitude: 87.3512,
      operationalStatus: 'ACTIVE',
    },
  });

  const mine2 = await prisma.mine.create({
    data: {
      code: 'MINE-JH-CCL-002',
      name: 'Piparwar Opencast Project',
      subsidiary: 'CCL',
      state: 'Jharkhand',
      district: 'Chatra',
      latitude: 23.7194,
      longitude: 85.0315,
      operationalStatus: 'ACTIVE',
    },
  });

  const mine3 = await prisma.mine.create({
    data: {
      code: 'MINE-CG-SECL-003',
      name: 'Gevra Mega Opencast Mine',
      subsidiary: 'SECL',
      state: 'Chhattisgarh',
      district: 'Korba',
      latitude: 22.3481,
      longitude: 82.5931,
      operationalStatus: 'ACTIVE',
    },
  });

  console.log('✅ Seeded 3 Mining Blocks (ECL, CCL, SECL)');

  // 5. Create Statutory Compliances
  await prisma.statutoryCompliance.createMany({
    data: [
      {
        mineId: mine1.id,
        title: 'Environmental Clearance (EC) - MoEFCC 2026',
        category: 'ENVIRONMENT',
        status: 'COMPLIANT',
        validUntil: new Date('2028-12-31'),
        remarks: 'Approved for 20 MTPA production cap with dust suppression mandatory.',
      },
      {
        mineId: mine1.id,
        title: 'DGMS Deep-Hole Blasting Safety Permit',
        category: 'SAFETY',
        status: 'COMPLIANT',
        validUntil: new Date('2027-06-30'),
        remarks: 'Vibration monitoring sensors required at pit boundary.',
      },
      {
        mineId: mine2.id,
        title: 'Consent to Operate (CTO) Air & Water Act',
        category: 'ENVIRONMENT',
        status: 'UNDER_REVIEW',
        validUntil: new Date('2026-10-15'),
        remarks: 'Effluent treatment plant efficiency audit in progress.',
      },
    ],
  });

  console.log('✅ Seeded Statutory Compliance Certificates');

  // 6. Create Genesis Block for Cryptographic Blockchain Ledger
  const genesisTimestamp = new Date();
  const genesisData = {
    blockIndex: 1,
    timestamp: genesisTimestamp,
    userId: adminUser.id,
    action: 'GENESIS_BLOCK_INITIALIZED',
    entity: 'System',
    entityId: 'GENESIS-001',
    metadata: {
      platform: 'CoalGov Smart Mining Governance Platform',
      architecture: 'PostgreSQL + Cryptographic SHA-256 Ledger',
      initializedBy: adminUser.email,
    },
    previousHash: GENESIS_PREVIOUS_HASH,
    nonce: 0,
  };

  const genesisHash = calculateHash(genesisData);

  await prisma.auditLog.create({
    data: {
      blockIndex: 1,
      userId: adminUser.id,
      action: genesisData.action,
      entity: genesisData.entity,
      entityId: genesisData.entityId,
      metadata: genesisData.metadata,
      previousHash: GENESIS_PREVIOUS_HASH,
      hash: genesisHash,
      nonce: 0,
      timestamp: genesisTimestamp,
    },
  });

  console.log(`⛓️ Blockchain Genesis Block Initialized with Hash: ${genesisHash}`);
  console.log('🎉 CoalGov Database & Blockchain Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
