const { z } = require('zod');

const ComplianceCategoryEnum = z.enum([
  'SAFETY',
  'ENVIRONMENT',
  'PRODUCTION',
  'LABOUR',
]);

const ComplianceStatusEnum = z.enum([
  'COMPLIANT',
  'NON_COMPLIANT',
  'UNDER_REVIEW',
  'EXPIRED',
]);

const createComplianceSchema = z.object({
  mineId: z.string().uuid('Invalid Mine ID format'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: ComplianceCategoryEnum,
  status: ComplianceStatusEnum.optional().default('UNDER_REVIEW'),
  validUntil: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  documentUrl: z.string().url('Invalid document URL').optional().or(z.string().optional()),
  remarks: z.string().optional(),
});

const updateComplianceSchema = createComplianceSchema.partial().omit({ mineId: true });

module.exports = {
  ComplianceCategoryEnum,
  ComplianceStatusEnum,
  createComplianceSchema,
  updateComplianceSchema,
};
