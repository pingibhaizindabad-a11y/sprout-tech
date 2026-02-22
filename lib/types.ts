/** Database and app types for Sprout. */

export interface Group {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  group_id: string;
  bio: string | null;
  avatar_url: string | null;
  is_matched: boolean;
  created_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  user_id: string;
  group_id: string;
  answers: Record<string, string | string[] | number>;
  submitted_at: string;
  is_locked: boolean;
}

export interface Match {
  id: string;
  group_id: string;
  user_ids: string[];
  match_type: "pair" | "trio";
  compatibility_score: number;
  match_explanation: MatchExplanation;
  created_at: string;
}

export interface MatchExplanation {
  complementary_strength?: string;
  shared_trait?: string;
  availability_insight?: string;
  trio_balance?: string;
}

export interface AdminUser {
  id: string;
  is_admin: boolean;
}
