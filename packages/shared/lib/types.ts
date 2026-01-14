import { z } from 'zod';

export const MetricType = z.enum([
  'ED_WAIT',
  'ADULT_ED_WAIT',
  'PEDIATRIC_ED_WAIT',
  'URGENT_CARE_WAIT'
]);

export type MetricType = z.infer<typeof MetricType>;

export const ParseMethod = z.enum([
  'html_regex',
  'dom_selector',
  'json_api',
  'headless'
]);

export type ParseMethod = z.infer<typeof ParseMethod>;

export const ScrapeStatus = z.enum([
  'OK',
  'STALE',
  'PARSE_FAIL',
  'FETCH_FAIL'
]);

export type ScrapeStatus = z.infer<typeof ScrapeStatus>;

export const WaitTimeRecordSchema = z.object({
  hospital_id: z.string(),
  metric_type: MetricType,
  wait_minutes: z.number().nullable(),
  last_updated_at: z.date().nullable(),
  fetched_at: z.date(),
  source_url: z.string().url(),
  parse_confidence: z.number().min(0).max(1),
  parse_method: ParseMethod,
  raw_excerpt: z.string().nullable(),
  raw_hash: z.string(),
  status: ScrapeStatus,
  error_message: z.string().nullable(),
});

export type WaitTimeRecord = z.infer<typeof WaitTimeRecordSchema>;

export const HospitalSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  region: z.string(),
  website: z.string().url().nullable(),
  waittime_source_url: z.string().url().nullable(),
  adapter_key: z.string(),
  active: z.boolean(),
  notes: z.string().nullable(),
});

export type Hospital = z.infer<typeof HospitalSchema>;
