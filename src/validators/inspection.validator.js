const { z } = require('zod');

const InspectionStatusEnum = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'FLAGGED',
]);

const scheduleInspectionSchema = z.object({
  mineId: z.string().uuid('Invalid Mine ID format'),
  inspectorId: z.string().uuid('Invalid Inspector ID format').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  notes: z.string().optional(),
});

const updateInspectionSchema = z.object({
  title: z.string().min(3).optional(),
  status: InspectionStatusEnum.optional(),
  scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  reportUrl: z.string().optional(),
  notes: z.string().optional(),
});

const completeInspectionSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Valid latitude is required for geo-tagging'),
  longitude: z.number().min(-180).max(180, 'Valid longitude is required for geo-tagging'),
  reportUrl: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['COMPLETED', 'FLAGGED']).optional().default('COMPLETED'),
});

module.exports = {
  InspectionStatusEnum,
  scheduleInspectionSchema,
  updateInspectionSchema,
  completeInspectionSchema,
};
