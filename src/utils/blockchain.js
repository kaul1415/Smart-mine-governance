const crypto = require('crypto');

const GENESIS_PREVIOUS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Calculates deterministic SHA-256 hash for a blockchain audit log block
 * @param {object} param0
 * @param {number} param0.blockIndex
 * @param {string|Date} param0.timestamp
 * @param {string|null} param0.userId
 * @param {string} param0.action
 * @param {string} param0.entity
 * @param {string|null} param0.entityId
 * @param {object|null} param0.metadata
 * @param {string} param0.previousHash
 * @param {number} [param0.nonce=0]
 * @returns {string} SHA-256 hex string (64 chars)
 */
const calculateHash = ({
  blockIndex,
  timestamp,
  userId = '',
  action,
  entity,
  entityId = '',
  metadata = null,
  previousHash,
  nonce = 0,
}) => {
  const formattedTimestamp = new Date(timestamp).toISOString();
  const serializedMetadata = metadata ? JSON.stringify(metadata) : '{}';

  const dataString = [
    String(blockIndex),
    formattedTimestamp,
    userId || '',
    action,
    entity,
    entityId || '',
    serializedMetadata,
    previousHash,
    String(nonce),
  ].join('|');

  return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Verifies the integrity of an entire blockchain audit log trajectory
 * @param {Array<object>} blocks - Array of audit log blocks ordered by blockIndex ASC
 * @returns {object} Integrity verification result
 */
const verifyChainIntegrity = (blocks) => {
  if (!blocks || blocks.length === 0) {
    return {
      isValid: true,
      totalBlocks: 0,
      message: 'Blockchain ledger is empty',
      tamperedBlock: null,
    };
  }

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i];

    // 1. Verify genesis block linkage
    if (i === 0) {
      if (currentBlock.previousHash !== GENESIS_PREVIOUS_HASH) {
        return {
          isValid: false,
          totalBlocks: blocks.length,
          tamperedBlock: {
            blockIndex: currentBlock.blockIndex,
            id: currentBlock.id,
            reason: `Genesis block previousHash mismatch. Expected ${GENESIS_PREVIOUS_HASH}, found ${currentBlock.previousHash}`,
          },
        };
      }
    } else {
      // 2. Verify hash pointer chaining
      const previousBlock = blocks[i - 1];
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          totalBlocks: blocks.length,
          tamperedBlock: {
            blockIndex: currentBlock.blockIndex,
            id: currentBlock.id,
            reason: `Previous hash linkage broken. Block #${currentBlock.blockIndex} previousHash (${currentBlock.previousHash}) does not match Block #${previousBlock.blockIndex} hash (${previousBlock.hash})`,
          },
        };
      }
    }

    // 3. Re-calculate SHA-256 hash to verify data payload has not been modified
    const recomputedHash = calculateHash({
      blockIndex: currentBlock.blockIndex,
      timestamp: currentBlock.timestamp,
      userId: currentBlock.userId,
      action: currentBlock.action,
      entity: currentBlock.entity,
      entityId: currentBlock.entityId,
      metadata: currentBlock.metadata,
      previousHash: currentBlock.previousHash,
      nonce: currentBlock.nonce || 0,
    });

    if (recomputedHash !== currentBlock.hash) {
      return {
        isValid: false,
        totalBlocks: blocks.length,
        tamperedBlock: {
          blockIndex: currentBlock.blockIndex,
          id: currentBlock.id,
          reason: `Cryptographic payload tampered! Recalculated hash (${recomputedHash}) does not match recorded hash (${currentBlock.hash})`,
        },
      };
    }
  }

  return {
    isValid: true,
    totalBlocks: blocks.length,
    genesisTimestamp: blocks[0].timestamp,
    latestTimestamp: blocks[blocks.length - 1].timestamp,
    message: 'Cryptographic ledger verified successfully. All block hashes and chain links are valid.',
    tamperedBlock: null,
  };
};

module.exports = {
  GENESIS_PREVIOUS_HASH,
  calculateHash,
  verifyChainIntegrity,
};
