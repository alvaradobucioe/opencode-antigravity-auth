/**
 * Transform Module Index
 * 
 * Re-exports transform functions and types for request transformation.
 */

// Types
export type {
  ModelFamily,
  ThinkingTier,
  TransformContext,
  TransformResult,
  TransformDebugInfo,
  RequestPayload,
  ThinkingConfig,
  ResolvedModel,
  GoogleSearchConfig,
} from "./types";

// Model resolution
export {
  resolveModelWithTier,
  resolveModelWithVariant,
  resolveModelForHeaderStyle,
  getModelFamily,
  MODEL_ALIASES,
  THINKING_TIER_BUDGETS,
  GEMINI_3_THINKING_LEVELS,
} from "./model-resolver";
export type { VariantConfig } from "./model-resolver";

// Claude transforms
export {
  isClaudeModel,
  isClaudeThinkingModel,
  configureClaudeToolConfig,
  buildClaudeThinkingConfig,
  ensureClaudeMaxOutputTokens,
  appendClaudeThinkingHint,
  normalizeClaudeTools,
  applyClaudeTransforms,
  CLAUDE_THINKING_MAX_OUTPUT_TOKENS,
  CLAUDE_INTERLEAVED_THINKING_HINT,
} from "./claude";
export type { ClaudeTransformOptions, ClaudeTransformResult } from "./claude";

// Antigravity & Gemini transforms
export {
  isGeminiModel,
  isGemini3Model,
  isGemini25Model,
  isImageGenerationModel,
  buildGemini3ThinkingConfig,
  buildGemini25ThinkingConfig,
  buildImageGenerationConfig,
  normalizeGeminiTools,
  applyGeminiTransforms,
  applyGeminiTransforms as applyAntigravityTransforms,
  normalizeGeminiTools as normalizeAntigravityTools,
} from "./antigravity";
export type {
  GeminiTransformOptions,
  GeminiTransformResult,
  GeminiTransformOptions as AntigravityTransformOptions,
  GeminiTransformResult as AntigravityTransformResult,
  ImageConfig,
} from "./antigravity";

// Cross-model sanitization
export {
  sanitizeCrossModelPayload,
  sanitizeCrossModelPayloadInPlace,
  getModelFamily as getCrossModelFamily,
  stripGeminiThinkingMetadata,
  stripClaudeThinkingFields,
} from "./cross-model-sanitizer";
export type { SanitizerOptions } from "./cross-model-sanitizer";
