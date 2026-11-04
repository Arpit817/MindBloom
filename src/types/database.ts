// ─── Database Table Types ────────────────────────────────────────────────────
// These types match the Supabase PostgreSQL schema defined in Stage 2.
// Do NOT modify these types without also updating the database migration files.

export interface Profile {
  id: string; // UUID — matches auth.users(id)
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string; // hex colour e.g. "#6366f1"
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  content: string;
  review_stage: number; // 0 = new, 1 = first review, etc.
  freshness_score: number; // 0–100
  next_review_at: string; // ISO timestamp
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteImage {
  id: string;
  note_id: string;
  user_id: string;
  storage_path: string; // Supabase storage path
  image_url: string | null; // public or signed URL
  file_name: string | null;
  file_size: number | null; // bytes
  mime_type: string | null; // e.g. "image/jpeg"
  display_order: number; // for ordering in gallery
  created_at: string;
}

export interface Question {
  id: string;
  note_id: string;
  question_text: string;
  answer_text: string;
  position: number; // 1, 2, or 3
  created_at: string;
  updated_at: string;
}

export type ReviewResult = "forgot" | "partial" | "remembered";

export interface ReviewSession {
  id: string;
  user_id: string;
  note_id: string;
  result: ReviewResult;
  previous_stage: number | null;
  new_stage: number | null;
  previous_next_review_at: string | null;
  new_next_review_at: string | null;
  reviewed_at: string;
}

export type ResourcePlatform = "YouTube" | "Other";
export type ResourceType = "video" | "playlist" | "link";

export interface LearningResource {
  id: string;
  user_id: string;
  subject_id: string | null;
  note_id: string | null;
  title: string;
  description: string | null;
  url: string;
  platform: ResourcePlatform;
  resource_type: ResourceType;
  created_at: string;
  updated_at: string;
}

export type PlanType = "day-wise" | "step-wise" | "custom";

export interface LearningPlan {
  id: string;
  user_id: string;
  resource_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  plan_type: PlanType;
  start_date: string | null; // ISO date "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}

export interface LearningPlanItem {
  id: string;
  plan_id: string;
  resource_id: string | null;
  title: string;
  description: string | null;
  step_number: number | null;
  day_number: number | null;
  scheduled_date: string | null; // ISO date "YYYY-MM-DD"
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityType =
  | "note_created"
  | "note_edited"
  | "note_reviewed"
  | "note_deleted"
  | "subject_created"
  | "subject_edited"
  | "subject_deleted"
  | "resource_added"
  | "resource_edited"
  | "plan_created"
  | "plan_step_completed"
  | "plan_step_reopened";

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  note_id: string | null;
  subject_id: string | null;
  resource_id: string | null;
  plan_id: string | null;
  description: string | null;
  created_at: string;
}

// ─── Freshness ───────────────────────────────────────────────────────────────

export type FreshnessStatus = "fresh" | "moderate" | "stale" | "critical";

// ─── Extended / Joined Types (returned by queries) ──────────────────────────

export interface NoteWithSubject extends Note {
  subject: Pick<Subject, "id" | "name" | "color">;
}

export interface NoteWithDetails extends NoteWithSubject {
  images: NoteImage[];
  questions: Question[];
}

export interface SubjectWithStats extends Subject {
  note_count?: number;
  due_count?: number;
  avg_freshness?: number;
}
