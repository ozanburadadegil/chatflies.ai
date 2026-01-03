export interface ChatMessage {
  id: string;
  source: 'slack' | 'telegram' | 'import';
  channel_or_thread_id: string;
  timestamp_iso: string;
  sender: string;
  text: string;
}

export interface ActionItem {
  text: string;
  owner: string | null;
  due_date_iso: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'done';
}

export interface TimeRange {
  start_iso: string;
  end_iso: string;
}

export interface ReportRequest {
  command_text: string;
  source: 'slack' | 'telegram' | 'import' | 'all';
  channel_or_thread_id: string | null;
  participants: string[];
  query: string | null;
  time_range: TimeRange;
  timezone: string;
}

export interface AnalysisReport {
  whatsapp_reply: string;
  workspace_id: string;
  request: ReportRequest;
  summary_bullets: string[];
  action_items: ActionItem[];
  decisions: string[];
  risks: string[];
  participants: string[];
  channels_or_threads: string[];
  details_url: string;
  confidence: number;
  generated_at?: string; // Client-side addition for display
}

// User & Auth Types
export type UserTier = 'free' | 'pro';

export interface UserProfile {
  id: string;
  tier: UserTier;
  credits: number;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse {
  text: string;
  savedReport?: AnalysisReport;
  remainingCredits: number;
  error?: ApiError;
}

// Internal app types
export interface AppState {
  view: 'chat' | 'dashboard' | 'settings';
  currentReportId: string | null;
  reports: Record<string, AnalysisReport>;
  user: UserProfile;
}

export interface ChatInteraction {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedReportId?: string;
  isThinking?: boolean;
}