// BKG Plan Engine Server - Main Entry Point
// Exports server components for plan review, annotation, and agent communication

// Core server
export { createServer, PlanServer } from './server.js';
export type { PlanServerOptions, PlanServerInstance } from './server.js';

// Annotation
export { Annotate } from './annotate.js';
export type { AnnotateOptions, AnnotateResult } from './annotate.js';

// Review
export { Review } from './review.js';
export type { ReviewOptions, ReviewResult } from './review.js';

// Marker Review (inline annotations)
export { MarkerReview } from './marker-review.js';
export type { MarkerReviewOptions, MarkerReviewResult } from './marker-review.js';

// Agent Jobs
export { AgentJobs } from './agent-jobs.js';
export type { AgentJob, AgentJobOptions } from './agent-jobs.js';

// Sessions
export { Sessions } from './sessions.js';
export type { Session, SessionOptions } from './sessions.js';

// Git Integration
export { Git } from './git.js';
export { GitHub } from './github.js';
export { GitLab } from './gitlab.js';
export type { GitOptions, GitStatus } from './git.js';

// AI Runtime
export { AI } from './ai-runtime.js';
export type { AIOptions, AIProvider } from './ai-runtime.js';

// Configuration
export { Config } from './config.js';
export type { ConfigOptions, ConfigSchema } from './config.js';