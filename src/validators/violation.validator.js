const { z } = require('zod');
const { ComplianceCategoryEnum } = require('./compliance.validator');

const SeverityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const ViolationStatusEnum = z.enum([
  'REPORTED',
  'ACTION_ASSIGNED',
  'RECTIFIED',
  'VERIFIED',
  'CLOSED',
]);

const createViolationSchema = z.object({
  inspectionId: z.string().uuid('Invalid Inspection ID format'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Detailed written description is required'),
  severity: SeverityEnum.optional().default('MEDIUM'),
  category: ComplianceCategoryEnum,
  deadline: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  noticePdfUrl: z.string().optional(), // Official Authority Notice PDF
  imageUrl: z.string().optional(),      // Photo evidence
});

const assignActionSchema = z.object({
  assigneeId: z.string().uuid('Invalid Assignee ID format'),
  actionPlan: z.string().min(5, 'Action plan description is required'),
});

// For Mine Official / Manager responding to a violation
const submitMineResponseSchema = z.object({
  responseText: z.string().min(5, 'Written explanation or response is required').optional(),
  responsePdfUrl: z.string().optional(), // Official written reply PDF from Mine
  evidenceUrl: z.string().optional(),    // Rectification photo/evidence PDF
  actionPlan: z.string().optional(),     // Updated action plan
  status: z.enum(['IN_PROGRESS', 'RESOLVED']).optional().default('RESOLVED'),
});

const updateActionStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED']),
  responseText: z.string().optional(),
  responsePdfUrl: z.string().optional(),
  evidenceUrl: z.string().optional(),
});

module.exports = {
  SeverityEnum,
  ViolationStatusEnum,
  createViolationSchema,
  assignActionSchema,
  submitMineResponseSchema,
  updateActionStatusSchema,
};
