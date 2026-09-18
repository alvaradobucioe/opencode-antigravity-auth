import type { ProviderModel } from "../types";

export type ModelThinkingLevel = "minimal" | "low" | "medium" | "high";

export interface ModelThinkingConfig {
  thinkingBudget: number;
}

export interface ModelVariant {
  thinkingLevel?: ModelThinkingLevel;
  thinkingConfig?: ModelThinkingConfig;
}

export interface ModelLimit {
  context: number;
  output: number;
}

export type ModelModality = "text" | "image" | "pdf";

export interface ModelModalities {
  input: ModelModality[];
  output: ModelModality[];
}

export interface OpencodeModelDefinition extends ProviderModel {
  name: string;
  limit: ModelLimit;
  modalities: ModelModalities;
  variants?: Record<string, ModelVariant>;
}

export type OpencodeModelDefinitions = Record<string, OpencodeModelDefinition>;

export const DEFAULT_MODALITIES: ModelModalities = {
  input: ["text", "image", "pdf"],
  output: ["text"],
};

export const IMAGE_GENERATION_MODALITIES: ModelModalities = {
  input: ["text", "image", "pdf"],
  output: ["image", "text"],
};

/**
 * Automatically calculates context and output token limits for a given model.
 */
export function calculateModelLimits(modelId: string): ModelLimit {
  const lower = modelId.toLowerCase();
  
  if (lower.includes("claude")) {
    return { context: 250000, output: 64000 };
  }
  if (lower.includes("gpt-oss")) {
    return { context: 131072, output: 16384 };
  }
  if (lower.includes("tab_flash_lite")) {
    return { context: 16384, output: 4096 };
  }
  if (lower.includes("pro")) {
    return { context: 1048576, output: 65535 };
  }
  // Standard Gemini 3.x and 2.5 models
  return { context: 1048576, output: 65536 };
}

/**
 * Automatically calculates modalities for a given model.
 */
export function calculateModelModalities(modelId: string): ModelModalities {
  const lower = modelId.toLowerCase();
  if (lower.includes("image") && !lower.includes("flash-lite")) {
    return IMAGE_GENERATION_MODALITIES;
  }
  return DEFAULT_MODALITIES;
}

/**
 * Automatically calculates reasoning / thinking variants for a given model.
 */
export function calculateModelVariants(modelId: string): Record<string, ModelVariant> | undefined {
  const lower = modelId.toLowerCase();

  // Claude thinking models
  if (lower.includes("claude") && lower.includes("thinking")) {
    return {
      low: { thinkingConfig: { thinkingBudget: 8192 } },
      max: { thinkingConfig: { thinkingBudget: 32768 } },
    };
  }

  // Gemini 3 Pro reasoning variants
  if (lower.includes("gemini-3") && lower.includes("pro")) {
    return {
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    };
  }

  // Gemini 3 Flash reasoning tiers
  if (
    lower.includes("gemini-3.8") ||
    lower.includes("gemini-3.7") ||
    lower.includes("gemini-3.6") ||
    (lower.includes("gemini-3") && lower.includes("flash") && !lower.includes("agent") && !lower.includes("image") && !lower.includes("lite"))
  ) {
    return {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    };
  }

  // Gemini 2.5 Flash Thinking
  if (lower.includes("2.5") && lower.includes("thinking")) {
    return {
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    };
  }

  return undefined;
}

/**
 * Factory to dynamically construct an OpencodeModelDefinition with automatic limits, modalities, and reasoning variants.
 */
export function buildModelDefinition(
  id: string,
  name: string,
  customVariants?: Record<string, ModelVariant>
): OpencodeModelDefinition {
  const limit = calculateModelLimits(id);
  const modalities = calculateModelModalities(id);
  const variants = customVariants ?? calculateModelVariants(id);

  const def: OpencodeModelDefinition = {
    name,
    limit,
    modalities,
  };

  if (variants && Object.keys(variants).length > 0) {
    def.variants = variants;
  }

  return def;
}

/**
 * Validated Antigravity models available on the unrestricted sandbox inference endpoint.
 */
export const OPENCODE_MODEL_DEFINITIONS: OpencodeModelDefinitions = {
  // Real API model IDs
  "gemini-3.8-flash-tiered": buildModelDefinition("gemini-3.8-flash-tiered", "Gemini 3.8 Flash Tiered"),
  "gemini-3.7-flash-tiered": buildModelDefinition("gemini-3.7-flash-tiered", "Gemini 3.7 Flash Tiered"),
  "gemini-3.6-flash-tiered": buildModelDefinition("gemini-3.6-flash-tiered", "Gemini 3.6 Flash Tiered"),
  "gemini-3.6-flash-high": buildModelDefinition("gemini-3.6-flash-high", "Gemini 3.6 Flash High"),
  "gemini-3.6-flash-medium": buildModelDefinition("gemini-3.6-flash-medium", "Gemini 3.6 Flash Medium"),
  "gemini-3.6-flash-low": buildModelDefinition("gemini-3.6-flash-low", "Gemini 3.6 Flash Low"),
  "gemini-3.5-flash-low": buildModelDefinition("gemini-3.5-flash-low", "Gemini 3.5 Flash Low"),
  "gemini-3.5-flash-extra-low": buildModelDefinition("gemini-3.5-flash-extra-low", "Gemini 3.5 Flash Extra Low"),
  "gemini-3.5-flash-lite": buildModelDefinition("gemini-3.5-flash-lite", "Gemini 3.5 Flash Lite"),
  "gemini-3-flash": buildModelDefinition("gemini-3-flash", "Gemini 3 Flash"),
  "gemini-3-flash-agent": buildModelDefinition("gemini-3-flash-agent", "Gemini 3 Flash Agent"),
  "gemini-3.1-pro-high": buildModelDefinition("gemini-3.1-pro-high", "Gemini 3.1 Pro High"),
  "gemini-3.1-pro-low": buildModelDefinition("gemini-3.1-pro-low", "Gemini 3.1 Pro Low"),
  "gemini-pro-agent": buildModelDefinition("gemini-pro-agent", "Gemini Pro Agent"),
  "gemini-2.5-flash-thinking": buildModelDefinition("gemini-2.5-flash-thinking", "Gemini 2.5 Flash Thinking"),
  "gemini-2.5-flash": buildModelDefinition("gemini-2.5-flash", "Gemini 2.5 Flash"),
  "gemini-2.5-flash-lite": buildModelDefinition("gemini-2.5-flash-lite", "Gemini 2.5 Flash Lite"),
  "gemini-2.5-pro": buildModelDefinition("gemini-2.5-pro", "Gemini 2.5 Pro"),
  "claude-opus-4-6-thinking": buildModelDefinition("claude-opus-4-6-thinking", "Claude Opus 4.6 Thinking"),
  "claude-sonnet-4-6": buildModelDefinition("claude-sonnet-4-6", "Claude Sonnet 4.6"),
  "gpt-oss-120b-medium": buildModelDefinition("gpt-oss-120b-medium", "GPT-OSS 120B Medium"),
  "tab_flash_lite_preview": buildModelDefinition("tab_flash_lite_preview", "Tab Flash Lite Preview"),
  "tab_jump_flash_lite_preview": buildModelDefinition("tab_jump_flash_lite_preview", "Tab Jump Flash Lite Preview"),
  "gemini-3.1-flash-image": buildModelDefinition("gemini-3.1-flash-image", "Gemini 3.1 Flash Image"),

  // Friendly Antigravity aliases
  "antigravity-gemini-3.8-flash": buildModelDefinition("antigravity-gemini-3.8-flash", "Gemini 3.8 Flash (Antigravity)"),
  "antigravity-gemini-3.7-flash": buildModelDefinition("antigravity-gemini-3.7-flash", "Gemini 3.7 Flash (Antigravity)"),
  "antigravity-gemini-3.6-flash": buildModelDefinition("antigravity-gemini-3.6-flash", "Gemini 3.6 Flash (Antigravity)"),
  "antigravity-gemini-3.5-flash-lite": buildModelDefinition("antigravity-gemini-3.5-flash-lite", "Gemini 3.5 Flash Lite (Antigravity)"),
  "antigravity-gemini-2.5-flash-thinking": buildModelDefinition("antigravity-gemini-2.5-flash-thinking", "Gemini 2.5 Flash Thinking (Antigravity)"),
  "antigravity-gemini-3-flash-agent": buildModelDefinition("antigravity-gemini-3-flash-agent", "Gemini 3 Flash Agent (Antigravity)"),
  "antigravity-gemini-pro-agent": buildModelDefinition("antigravity-gemini-pro-agent", "Gemini Pro Agent (Antigravity)"),
  "antigravity-gemini-3.1-flash-image": buildModelDefinition("antigravity-gemini-3.1-flash-image", "Gemini 3.1 Flash Image (Antigravity)"),
  "antigravity-gpt-oss-120b-medium": buildModelDefinition("antigravity-gpt-oss-120b-medium", "GPT-OSS 120B Medium (Antigravity)"),
  "antigravity-gemini-3-pro": buildModelDefinition("antigravity-gemini-3-pro", "Gemini 3 Pro (Antigravity)"),
  "antigravity-gemini-3.1-pro": buildModelDefinition("antigravity-gemini-3.1-pro", "Gemini 3.1 Pro (Antigravity)"),
  "antigravity-gemini-3-flash": buildModelDefinition("antigravity-gemini-3-flash", "Gemini 3 Flash (Antigravity)"),
  "antigravity-claude-sonnet-4-6": buildModelDefinition("antigravity-claude-sonnet-4-6", "Claude Sonnet 4.6 (Antigravity)"),
  "antigravity-claude-opus-4-6-thinking": buildModelDefinition("antigravity-claude-opus-4-6-thinking", "Claude Opus 4.6 Thinking (Antigravity)"),
};
