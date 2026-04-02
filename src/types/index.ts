// ============================================================
// District (data/districts.json)
// ============================================================

export type DistrictType = "urban" | "mixed" | "rural";

export interface Coords {
  lat: number;
  lng: number;
}

export interface District {
  id: string;
  name_ru: string;
  name_uz: string;
  region_ru: string;
  region_uz: string;
  type: DistrictType;
  population: number;
  coords: Coords;
}

// ============================================================
// Business Type (data/business_types.json)
// ============================================================

export type BusinessCategory =
  | "production"
  | "services"
  | "food"
  | "trade"
  | "agriculture"
  | "education"
  | "transport"
  | "creative"
  | "it"
  | "construction";

export type RiskLevel = "low" | "medium" | "high";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type SeasonCoefficients = Record<Season, number>;

export interface ChecklistStep {
  step: number;
  text_ru: string;
  text_uz?: string;
  text_en?: string;
  link: string | null;
}

export interface BusinessType {
  id: string;
  name_ru: string;
  name_uz: string;
  category: BusinessCategory;
  required_skills: string[];
  optional_skills: string[];
  min_capital_mln: number;
  max_capital_mln: number;
  requires_collateral: boolean;
  location_types: DistrictType[];
  seasons: SeasonCoefficients;
  risk_level: RiskLevel;
  avg_monthly_revenue_mln: number;
  avg_monthly_expense_mln: number;
  breakeven_months: number;
  requires_premises: boolean;
  target_clients: string;
  govt_support: boolean;
  description_ru: string;
  checklist_steps: ChecklistStep[];
}

// ============================================================
// Bank Product (data/banks.json)
// ============================================================

export type Gender = "any" | "female" | "male";

export type TargetAudience =
  | "self_employed"
  | "individual"
  | "women"
  | "sme"
  | "agriculture"
  | "youth"
  | "rural"
  | "poor_registry";

export type LocationRestriction = "mahalla_attached" | "remote_district";

export type ApprovalRate = "low" | "medium" | "high";

export interface BankProduct {
  id: string;
  bank_name_ru: string;
  bank_name_uz: string;
  product_name_ru: string;
  product_name_uz: string;
  logo_emoji: string;
  website: string;
  min_amount_mln: number;
  max_amount_mln: number;
  interest_rate_annual: number;
  term_months_max: number;
  grace_period_months?: number;
  requires_collateral: boolean;
  requires_guarantor: boolean;
  target_audience: TargetAudience[];
  location_restriction: LocationRestriction[];
  age_min: number;
  age_max: number;
  gender: Gender;
  processing_days: number;
  approval_rate: ApprovalRate;
  digital_application: boolean;
  notes_ru: string;
  notes_uz: string;
  conditions: string[];
  suitable_for_businesses: string[];
}

// ============================================================
// Survey
// ============================================================

export type UserPath = "work" | "business";

export type Locale = "uz" | "ru" | "en";

export type QuestionType =
  | "single_choice"
  | "multi_choice"
  | "district_select"
  | "free_text"
  | "number_input"
  | "path_split";

export interface QuestionOption {
  value: string;
  label_uz: string;
  label_ru: string;
  label_en: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text_uz: string;
  text_ru: string;
  text_en: string;
  options?: QuestionOption[];
  required: boolean;
  next: (answers: SurveyAnswers) => string | null;
}

export type SurveyAnswers = Record<string, string | string[]>;

export interface SurveyAnswer {
  question_id: string;
  value: string | string[];
}

export interface SurveySession {
  id: string;
  lang: Locale;
  district_id: string;
  path: UserPath;
  answers: SurveyAnswer[];
  completed: boolean;
  created_at: string;
}

// ============================================================
// Scoring
// ============================================================

export interface ScoreBreakdown {
  skills_match: number;
  capital_sufficient: number;
  competition_low: number;
  risk_acceptable: number;
  season_fit: number;
}

export interface ScoredBusiness {
  business_type_id: string;
  business_type: BusinessType;
  total_score: number;
  breakdown: ScoreBreakdown;
  rank: number;
}

export interface BankMatch {
  bank_product: BankProduct;
  match_reasons: string[];
  disqualifiers: string[];
  is_eligible: boolean;
  priority: number;
}

// ============================================================
// Recommendation & Business Plan
// ============================================================

export interface BusinessPlan {
  session_id: string;
  business_type_id: string;
  summary_ru: string;
  summary_uz: string;
  steps: ChecklistStep[];
  estimated_capital_mln: number;
  estimated_monthly_profit_mln: number;
  risks: string[];
  ai_generated: boolean;
  created_at: string;
}

/** JSON structure returned by Claude API */
export interface BusinessPlanResult {
  summary: string;
  target_audience: string;
  startup_costs: Array<{ item: string; amount_mln: number }>;
  monthly_forecast: {
    revenue_mln: number;
    expenses_mln: number;
    profit_mln: number;
  };
  breakeven_months: number;
  risks: Array<{ risk: string; mitigation: string }>;
  mentor_note: string;
}

export interface Recommendation {
  id: string;
  session_id: string;
  top_businesses: ScoredBusiness[];
  bank_matches: BankMatch[];
  business_plan: BusinessPlan | null;
  created_at: string;
}

// ============================================================
// Progress Tracking
// ============================================================

export interface ProgressStep {
  step_index: number;
  text: string;
  link: string | null;
  completed: boolean;
  completed_at: string | null;
}

export interface UserProgress {
  id: string;
  session_id: string;
  business_type_id: string;
  steps: ProgressStep[];
  started_at: string;
  updated_at: string;
}

// ============================================================
// User Profile (personal data for business plan quality)
// ============================================================

export type EducationLevel = "secondary" | "vocational" | "higher" | "none";
export type EmploymentStatus = "unemployed" | "part_time" | "informal" | "student";

export interface UserProfile {
  id?: string;
  session_id?: string;
  full_name: string;
  phone: string;
  birth_year?: number;
  gender?: "male" | "female";
  district_id: string;
  education?: EducationLevel;
  family_size?: number;
  monthly_income_mln?: number;
  employment_status?: EmploymentStatus;
  has_business_experience?: boolean;
  created_at?: string;
}

// ============================================================
// Success Stories
// ============================================================

export interface SuccessStory {
  id: string;
  district_id: string;
  business_type_id: string;
  story_ru: string;
  story_uz: string;
  verified: boolean;
  created_at: string;
}
