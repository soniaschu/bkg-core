// @plannotator/shared/goal-setup

export interface GoalSetupBundle { [key: string]: any; }
export interface GoalSetupFactResult { [key: string]: any; }
export interface GoalSetupQuestionAnswer { [key: string]: any; }
export interface GoalSetupResult { [key: string]: any; }
export function normalizeGoalSetupBundle(bundle: GoalSetupBundle): GoalSetupBundle { return bundle; }
export function createFactsResult(facts: any): GoalSetupFactResult { return {}; }
export function createInterviewResult(answers: any[]): GoalSetupResult { return {}; }

