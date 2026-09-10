const { z } = require('zod');

const createMineSchema = z.object({
  code: z.string().min(2, 'Mine code is required (e.g., MINE-JH-001)'),
  name: z.string().min(2, 'Mine name must be at least 2 characters'),
  subsidiary: z.string().min(2, 'Subsidiary name is required (e.g., ECL, BCCL, CCL, SECL)'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  operationalStatus: z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']).optional().default('ACTIVE'),
});

const updateMineSchema = createMineSchema.partial();

const mineFilterQuerySchema = z.object({
  search: z.string().optional(),
  subsidiary: z.string().optional(),
  state: z.string().optional(),
  operationalStatus: z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
});

module.exports = {
  createMineSchema,
  updateMineSchema,
  mineFilterQuerySchema,
};
