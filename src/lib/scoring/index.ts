import type {
  SurveyAnswers,
  DistrictType,
  Season,
  BusinessType,
  BankProduct,
  ScoredBusiness,
  ScoreBreakdown,
  BankMatch,
} from "@/types";
import businessTypesData from "../../../data/business_types.json";
import banksData from "../../../data/banks.json";

const businessTypes = businessTypesData as BusinessType[];
const banks = banksData as BankProduct[];

// ============================================================
// Helpers
// ============================================================

function str(answers: SurveyAnswers, key: string): string {
  const v = answers[key];
  return typeof v === "string" ? v : "";
}

function arr(answers: SurveyAnswers, key: string): string[] {
  const v = answers[key];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return [v];
  return [];
}

function capitalRangeToMln(range: string): number {
  switch (range) {
    case "0-5": return 5;
    case "5-20": return 20;
    case "20-50": return 50;
    case "50-100": return 100;
    case "100+": return 200;
    default: return 0;
  }
}

// ============================================================
// 1. getCurrentSeason
// ============================================================

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

// ============================================================
// 2. scoreBusinessTypes (improved differentiation)
// ============================================================

export function scoreBusinessTypes(
  answers: SurveyAnswers,
  districtType: DistrictType
): ScoredBusiness[] {
  const userSkills = arr(answers, "skills");
  const capitalRange = str(answers, "capital");
  const competition = str(answers, "competition");
  const hasPremises = str(answers, "premises");
  const sphere = str(answers, "sphere"); // user's chosen sphere
  const season = getCurrentSeason();
  const userCapital = capitalRangeToMln(capitalRange);

  // Map sphere to specific business type IDs (primary) and related categories (secondary)
  const sphereToPrimary: Record<string, string[]> = {
    food: ["food_catering", "bakery"],
    beauty: ["beauty_salon", "barbershop"],
    sewing: ["sewing_studio"],
    trade: ["grocery_shop", "market_stall", "online_shop"],
    agro: ["greenhouse", "poultry_farming", "livestock"],
    repair: ["phone_repair", "car_repair", "construction_repair"],
    transport: ["transport_taxi"],
    education: ["tutoring", "kindergarten_private"],
    digital: ["it_services", "photo_video", "online_shop"],
    services: ["laundry", "car_wash"],
  };
  const primaryIds = sphereToPrimary[sphere] || [];

  const scored = businessTypes.map((biz) => {
    // Only show businesses from the user's chosen sphere
    // No "related" fillers — if you chose trade, you see trade businesses only
    const sphereMultiplier = primaryIds.includes(biz.id) ? 1.0 : 0;

    // --- skills_match: required (full weight) + optional (0.5x bonus) ---
    let requiredMatch = 0;
    if (biz.required_skills.length === 0) {
      requiredMatch = 0.8;
    } else {
      requiredMatch =
        biz.required_skills.filter((s) => userSkills.includes(s)).length /
        biz.required_skills.length;
    }
    // Bonus for optional skills
    const optionalMatch =
      biz.optional_skills.length > 0
        ? biz.optional_skills.filter((s) => userSkills.includes(s)).length /
          biz.optional_skills.length
        : 0;
    const skillsMatch = Math.min(1, requiredMatch + optionalMatch * 0.3);

    // --- capital_sufficient: graduated scale ---
    let capitalSufficient: number;
    if (userCapital >= biz.max_capital_mln) {
      capitalSufficient = 1.0; // Can fully fund
    } else if (userCapital >= biz.min_capital_mln) {
      capitalSufficient = 0.8; // Can start at minimum
    } else if (userCapital >= biz.min_capital_mln * 0.5) {
      capitalSufficient = 0.5; // Needs loan but feasible
    } else {
      capitalSufficient = 0.2; // Significant funding gap
    }

    // --- competition_low: softer scale ---
    let competitionLow: number;
    switch (competition) {
      case "none": competitionLow = 1.0; break;
      case "few": competitionLow = 0.6; break;
      case "many": competitionLow = 0.25; break;
      default: competitionLow = 0.5;
    }

    // --- risk_ok: based on risk level (balanced approach since we removed priority question) ---
    let riskOk: number;
    switch (biz.risk_level) {
      case "low": riskOk = 1.0; break;
      case "medium": riskOk = 0.6; break;
      case "high": riskOk = 0.2; break;
      default: riskOk = 0.5;
    }

    // --- season_ok: current season coefficient ---
    const seasonOk = biz.seasons[season] ?? 1.0;

    // Weighted total — sphere multiplier ensures user's chosen field dominates
    let totalScore = (
      skillsMatch * 0.30 +
      capitalSufficient * 0.25 +
      competitionLow * 0.15 +
      riskOk * 0.15 +
      seasonOk * 0.15
    ) * sphereMultiplier;

    // Bonus: premises match
    if (biz.requires_premises && hasPremises === "no") {
      totalScore *= 0.85; // Slight penalty, not dealbreaker
    } else if (!biz.requires_premises && (hasPremises === "no" || hasPremises === "home")) {
      totalScore *= 1.05; // Bonus — can work from home
    }

    // Penalize location mismatch
    if (biz.location_types.length > 0 && !biz.location_types.includes(districtType)) {
      totalScore *= 0.3;
    }

    // Cap at 1.0
    totalScore = Math.min(1, totalScore);

    const breakdown: ScoreBreakdown = {
      skills_match: skillsMatch,
      capital_sufficient: capitalSufficient,
      competition_low: competitionLow,
      risk_acceptable: riskOk,
      season_fit: seasonOk,
    };

    return {
      business_type_id: biz.id,
      business_type: biz,
      total_score: Math.round(totalScore * 1000) / 1000,
      breakdown,
      rank: 0,
    };
  });

  // Only return businesses that match the user's sphere (score > 0)
  const matching = scored
    .filter((s) => s.total_score > 0)
    .sort((a, b) => b.total_score - a.total_score);
  matching.forEach((item, i) => { item.rank = i + 1; });
  return matching;
}

// ============================================================
// 3. selectBankProducts
// ============================================================

export function selectBankProducts(
  answers: SurveyAnswers,
  businessId: string,
  districtType?: DistrictType
): BankMatch[] {
  const hasCollateral = str(answers, "collateral") === "yes";
  // Gender and age come from registration, not survey questions
  const isFemale = str(answers, "user_gender_actual") === "female";
  const birthYear = parseInt(str(answers, "user_birth_year") || "0");
  const age = birthYear > 0 ? new Date().getFullYear() - birthYear : 30;
  const isPoorRegistry = str(answers, "poor_registry") === "yes";
  const isRural = districtType === "rural";

  const results: BankMatch[] = banks.map((bank) => {
    const matchReasons: string[] = [];
    const disqualifiers: string[] = [];
    let priority = 0;

    if (bank.requires_collateral && !hasCollateral) {
      disqualifiers.push("Требуется залог, а у вас его нет");
    }

    if (bank.suitable_for_businesses.includes(businessId)) {
      matchReasons.push("Подходит для данного вида бизнеса");
      priority += 10;
    }

    if (isFemale && bank.gender === "female") {
      matchReasons.push("Специальная программа для женщин");
      priority += 20;
    }
    if (!isFemale && bank.gender === "female") {
      disqualifiers.push("Только для женщин");
    }

    if (age <= 30 && bank.age_max <= 30) {
      matchReasons.push("Программа для молодёжи до 30 лет");
      priority += 15;
    }

    if (isRural && bank.location_restriction.includes("remote_district")) {
      matchReasons.push("Льготные условия для отдалённых районов");
      priority += 15;
    }

    if (isPoorRegistry && bank.target_audience.includes("poor_registry")) {
      matchReasons.push("Программа для малообеспеченных семей");
      priority += 15;
    }

    if (!bank.requires_collateral && !bank.requires_guarantor) {
      matchReasons.push("Без залога и поручителей");
      priority += 5;
    }

    if (bank.digital_application) {
      matchReasons.push("Онлайн заявка");
      priority += 3;
    }

    if (bank.interest_rate_annual <= 20) {
      matchReasons.push(`Льготная ставка ${bank.interest_rate_annual}%`);
      priority += 5;
    }

    const isEligible = disqualifiers.length === 0;

    return {
      bank_product: bank,
      match_reasons: matchReasons,
      disqualifiers,
      is_eligible: isEligible,
      priority: isEligible ? priority : -1,
    };
  });

  results.sort((a, b) => b.priority - a.priority);
  return results.filter((r) => r.is_eligible).slice(0, 3);
}
