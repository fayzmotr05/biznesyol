import type { Question, SurveyAnswers } from "@/types";
import {
  getQuestionById,
  FIRST_QUESTION_ID,
  COMMON_QUESTION_IDS,
  JOB_QUESTION_IDS,
  SPHERE_QUESTION_COUNTS,
} from "./questions";

export function getQuestion(id: string): Question {
  const q = getQuestionById(id);
  if (!q) throw new Error(`Question not found: ${id}`);
  return q;
}

export function getNextQuestionId(
  currentId: string,
  answers: SurveyAnswers
): string | null {
  const question = getQuestion(currentId);
  return question.next(answers);
}

/**
 * Get total question count for progress bar.
 * Dynamically includes sphere-specific questions.
 */
function getTotalQuestions(answers: SurveyAnswers): number {
  const path = answers.path as string;

  if (path === "job") {
    return COMMON_QUESTION_IDS.length + JOB_QUESTION_IDS.length;
  }

  // Business path: common + register + sphere selection + sphere questions + financial
  const sphere = answers.sphere as string;
  const sphereCount = sphere ? (SPHERE_QUESTION_COUNTS[sphere] ?? 4) : 4;
  const financialCount = 7; // capital, collateral, competition, priority, gender, poor_registry, age_group

  return COMMON_QUESTION_IDS.length + 1 + sphereCount + financialCount; // +1 for sphere selection
}

export function isComplete(answers: SurveyAnswers): boolean {
  // Survey is done when age_group is answered (business) or job_relocate (job)
  const path = answers.path as string;
  if (path === "job") return "job_relocate" in answers;
  if (path === "business") return "age_group" in answers;
  return false;
}

export function getSurveyProgress(answers: SurveyAnswers): {
  current: number;
  total: number;
} {
  const total = getTotalQuestions(answers);

  // Count answered questions by walking the chain
  let count = 0;
  let id: string | null = FIRST_QUESTION_ID;
  while (id) {
    if (id in answers) {
      count++;
      try {
        const q = getQuestion(id);
        id = q.next(answers);
      } catch {
        break;
      }
    } else {
      break;
    }
  }

  return { current: count, total };
}

export function getCurrentQuestionId(answers: SurveyAnswers): string | null {
  let id: string | null = FIRST_QUESTION_ID;

  while (id) {
    if (!(id in answers)) return id;
    try {
      const question = getQuestion(id);
      id = question.next(answers);
    } catch {
      return null;
    }
  }

  return null;
}
