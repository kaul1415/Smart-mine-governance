const { GENESIS_PREVIOUS_HASH, calculateHash, verifyChainIntegrity } = require('../src/utils/blockchain');

console.log('🧪 Testing Cryptographic Blockchain Audit Engine...');

// 1. Create Genesis Block
const genesisBlock = {
  id: 'block-001',
  blockIndex: 1,
  timestamp: new Date('2026-01-01T00:00:00.000Z'),
  userId: 'usr-admin-01',
  action: 'GENESIS_BLOCK_INITIALIZED',
  entity: 'System',
  entityId: 'SYS-001',
  metadata: { platform: 'CoalGov', version: '1.4.0' },
  previousHash: GENESIS_PREVIOUS_HASH,
  nonce: 0,
};

genesisBlock.hash = calculateHash(genesisBlock);
console.log('✅ Genesis Block Hash:', genesisBlock.hash);

// 2. Create Block 2 (Mine Registration)
const block2 = {
  id: 'block-002',
  blockIndex: 2,
  timestamp: new Date('2026-01-02T10:30:00.000Z'),
  userId: 'usr-admin-01',
  action: 'MINE_REGISTERED',
  entity: 'Mine',
  entityId: 'mine-001',
  metadata: { code: 'MINE-JH-ECL-001', name: 'Rajmahal Opencast Mine' },
  previousHash: genesisBlock.hash,
  nonce: 0,
};
block2.hash = calculateHash(block2);
console.log('✅ Block #2 Hash:', block2.hash);

// 3. Create Block 3 (Inspection Logged)
const block3 = {
  id: 'block-003',
  blockIndex: 3,
  timestamp: new Date('2026-01-03T14:15:00.000Z'),
  userId: 'usr-inspector-01',
  action: 'INSPECTION_COMPLETED',
  entity: 'Inspection',
  entityId: 'insp-001',
  metadata: { title: 'Quarterly Safety Audit', status: 'COMPLETED' },
  previousHash: block2.hash,
  nonce: 0,
};
block3.hash = calculateHash(block3);
console.log('✅ Block #3 Hash:', block3.hash);

// 4. Verify Chain Integrity (Valid Chain)
const chain = [genesisBlock, block2, block3];
const resultValid = verifyChainIntegrity(chain);
console.log('\n🔍 Chain Verification Result (Untampered):');
console.log(resultValid);

if (!resultValid.isValid) {
  console.error('❌ Chain verification failed unexpectedly!');
  process.exit(1);
}

// 5. Test Tamper Detection (Modify Block #2 metadata directly)
const tamperedChain = [
  genesisBlock,
  {
    ...block2,
    metadata: { code: 'MINE-TAMPERED-001', name: 'Altered Mine Name' },
  },
  block3,
];

const resultTampered = verifyChainIntegrity(tamperedChain);
console.log('\n⚠️ Chain Verification Result (After Tampering):');
console.log(resultTampered);

if (resultTampered.isValid) {
  console.error('❌ Tamper detection failed to flag altered payload!');
  process.exit(1);
}

console.log('\n🎉 ALL CRYPTOGRAPHIC BLOCKCHAIN AUDIT TESTS PASSED SUCCESSFULLY!');
