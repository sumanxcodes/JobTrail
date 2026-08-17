export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export const APPLICATION_STATUSES: { label: string; value: ApplicationStatus; colorClass: string }[] = [
  { label: 'Draft', value: 'draft', colorClass: 'status-draft' },
  { label: 'Applied', value: 'applied', colorClass: 'status-applied' },
  { label: 'Interviewing', value: 'interviewing', colorClass: 'status-interviewing' },
  { label: 'Offer', value: 'offer', colorClass: 'status-offer' },
  { label: 'Rejected', value: 'rejected', colorClass: 'status-rejected' },
  { label: 'Withdrawn', value: 'withdrawn', colorClass: 'status-withdrawn' },
];

export type ParseStatus = 'success' | 'partial' | 'failed' | 'manual';
export type SourceType = 'link' | 'paste' | 'manual';

export interface Application {
  id: string;
  user_id: string;
  company: string;
  title: string;
  location: string | null;
  salary_range: string | null;
  seniority: string | null;
  job_url: string | null;
  raw_jd: string | null;
  parse_status: ParseStatus | null;
  status: ApplicationStatus;
  source_type: SourceType | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  changed_at: string;
}

export interface ParseRateLimit {
  user_id: string;
  attempt_count: number;
  window_started_at: string;
}

export interface ParsedJobData {
  company: string | null;
  title: string | null;
  location: string | null;
  salary_range: string | null;
  seniority: string | null;
  requirements_summary: string | null;
  job_url: string | null;
}

export type ParseJdResponse =
  | {
      status: 'success' | 'partial';
      extracted: ParsedJobData;
      raw_jd: string;
    }
  | {
      status: 'failed';
      reason: 'fetch_failed' | 'content_too_short' | 'parse_failed';
      raw_jd: string | null;
    }
  | {
      status: 'rate_limited';
    };
