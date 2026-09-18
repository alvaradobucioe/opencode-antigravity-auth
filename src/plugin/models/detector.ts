/**
 * Antigravity Dynamic Model Detector
 *
 * Dynamically queries the Antigravity API (daily-cloudcode-pa.sandbox.googleapis.com
 * or fallback endpoints) to discover available models, maximum context tokens,
 * maximum output tokens, multimodal capabilities, and reasoning/thinking configurations.
 */

import {
  ANTIGRAVITY_ENDPOINT_DAILY,
  ANTIGRAVITY_ENDPOINT_FALLBACKS,
  getAntigravityHeaders,
} from "../../constants";
import type { ModelLimit, ModelModalities, ModelVariant, OpencodeModelDefinition, OpencodeModelDefinitions } from "../config/models";
import { DEFAULT_MODALITIES, IMAGE_GENERATION_MODALITIES } from "../config/models";

export interface RawModelApiInfo {
  maxTokens?: number;
  maxOutputTokens?: number;
  supportsThinking?: boolean;
  minThinkingBudget?: number;
  thinkingBudget?: number;
  supportsImages?: boolean;
  supportsVideo?: boolean;
  supportedMimeTypes?: Record<string, boolean>;
  recommended?: boolean;
}

export interface FetchAvailableModelsApiResponse {
  models?: Record<string, RawModelApiInfo>;
}

/**
 * Seed catalog of verified Antigravity models discovered live from the daily sandbox API.
 */
export const VERIFIED_ANTIGRAVITY_MODELS: Record<string, RawModelApiInfo> = {
  "gemini-3.8-flash-tiered": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-3.7-flash-tiered": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-3.6-flash-tiered": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-3.6-flash-high": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-3.6-flash-medium": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: 4000,
  } as RawModelApiInfo,
  "gemini-3.6-flash-low": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: 1000,
  } as RawModelApiInfo,
  "gemini-3.5-flash-low": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: 4000,
  } as RawModelApiInfo,
  "gemini-3.5-flash-extra-low": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: 1000,
  } as RawModelApiInfo,
  "gemini-3.5-flash-lite": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-3-flash": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-3-flash-agent": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 32,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-3.1-pro-high": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: 10001,
  } as RawModelApiInfo,
  "gemini-3.1-pro-low": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: 1001,
  } as RawModelApiInfo,
  "gemini-pro-agent": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: 10001,
  } as RawModelApiInfo,
  "gemini-2.5-flash-thinking": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-2.5-flash": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-2.5-flash-lite": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: -1,
  } as RawModelApiInfo,
  "gemini-2.5-pro": {
    maxTokens: 1048576,
    maxOutputTokens: 65535,
    supportsThinking: true,
    images: true,
    minThinkingBudget: 128,
    thinkingBudget: 1024,
  } as RawModelApiInfo,
  "claude-opus-4-6-thinking": {
    maxTokens: 250000,
    maxOutputTokens: 64000,
    supportsThinking: true,
    images: true,
    minThinkingBudget: undefined,
    thinkingBudget: 1024,
  } as RawModelApiInfo,
  "claude-sonnet-4-6": {
    maxTokens: 250000,
    maxOutputTokens: 64000,
    supportsThinking: true,
    images: true,
    minThinkingBudget: undefined,
    thinkingBudget: 1024,
  } as RawModelApiInfo,
  "gpt-oss-120b-medium": {
    maxTokens: 131072,
    maxOutputTokens: 32768,
    supportsThinking: true,
    images: false,
    minThinkingBudget: undefined,
    thinkingBudget: 8192,
  } as RawModelApiInfo,
  "tab_flash_lite_preview": {
    maxTokens: 16384,
    maxOutputTokens: 4096,
    supportsThinking: false,
    images: false,
  } as RawModelApiInfo,
  "tab_jump_flash_lite_preview": {
    maxTokens: 16384,
    maxOutputTokens: 4096,
    supportsThinking: false,
    images: false,
  } as RawModelApiInfo,
  "gemini-3.1-flash-image": {
    maxTokens: 1048576,
    maxOutputTokens: 65536,
    supportsThinking: false,
    images: true,
  } as RawModelApiInfo,
};

let cachedDynamicDefinitions: OpencodeModelDefinitions | null = null;

/**
 * Derives user-friendly display name from API model ID.
 */
export function formatModelDisplayName(modelId: string): string {
  if (modelId === "gemini-3.8-flash-tiered") return "Gemini 3.8 Flash (Antigravity)";
  if (modelId === "gemini-3.7-flash-tiered") return "Gemini 3.7 Flash (Antigravity)";
  if (modelId === "gemini-3.6-flash-tiered") return "Gemini 3.6 Flash (Antigravity)";
  if (modelId === "gemini-2.5-flash-thinking") return "Gemini 2.5 Flash Thinking (Antigravity)";
  if (modelId === "claude-opus-4-6-thinking") return "Claude Opus 4.6 Thinking (Antigravity)";
  if (modelId === "claude-sonnet-4-6") return "Claude Sonnet 4.6 (Antigravity)";
  if (modelId === "gpt-oss-120b-medium") return "GPT-OSS 120B Medium (Antigravity)";
  if (modelId === "tab_flash_lite_preview") return "Tab Flash Lite Preview (Antigravity)";
  if (modelId === "gemini-3.1-flash-image") return "Gemini 3.1 Flash Image (Antigravity)";
  
  return modelId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") + " (Antigravity)";
}

/**
 * Calculates reasoning levels / thinking variants from detected API parameters.
 */
export function deriveVariantsFromApiInfo(modelId: string, info: RawModelApiInfo): Record<string, ModelVariant> | undefined {
  const lower = modelId.toLowerCase();

  if (lower.includes("claude") && lower.includes("thinking")) {
    return {
      low: { thinkingConfig: { thinkingBudget: 8192 } },
      max: { thinkingConfig: { thinkingBudget: 32768 } },
    };
  }

  if (lower.includes("gemini-3") && lower.includes("pro")) {
    return {
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    };
  }

  if (info.supportsThinking) {
    if (lower.includes("gemini-3")) {
      return {
        minimal: { thinkingLevel: "minimal" },
        low: { thinkingLevel: "low" },
        medium: { thinkingLevel: "medium" },
        high: { thinkingLevel: "high" },
      };
    }
    if (lower.includes("2.5") && lower.includes("thinking")) {
      return {
        low: { thinkingLevel: "low" },
        medium: { thinkingLevel: "medium" },
        high: { thinkingLevel: "high" },
      };
    }
  }

  return undefined;
}

/**
 * Builds an OpencodeModelDefinition dynamically from detected parameters.
 */
export function buildDynamicModelDefinition(modelId: string, info: RawModelApiInfo): OpencodeModelDefinition {
  const context = info.maxTokens ?? 1048576;
  const output = info.maxOutputTokens ?? 65536;
  const limit: ModelLimit = { context, output };

  const isImageOutput = modelId.toLowerCase().includes("image") && !modelId.toLowerCase().includes("lite");
  const modalities: ModelModalities = isImageOutput ? IMAGE_GENERATION_MODALITIES : DEFAULT_MODALITIES;

  const variants = deriveVariantsFromApiInfo(modelId, info);

  const def: OpencodeModelDefinition = {
    name: formatModelDisplayName(modelId),
    limit,
    modalities,
  };

  if (variants && Object.keys(variants).length > 0) {
    def.variants = variants;
  }

  return def;
}

/**
 * Converts a raw model map from the API into a complete OpencodeModelDefinitions dictionary.
 */
export function convertApiModelsToDefinitions(models: Record<string, RawModelApiInfo>): OpencodeModelDefinitions {
  const definitions: OpencodeModelDefinitions = {};

  for (const [modelId, info] of Object.entries(models)) {
    const def = buildDynamicModelDefinition(modelId, info);
    // Expose both real model ID and antigravity-prefixed alias
    definitions[modelId] = def;
    definitions[`antigravity-${modelId}`] = def;
  }

  return definitions;
}

/**
 * Queries the Antigravity API directly to fetch the live model catalog and their parameters.
 */
export async function detectModelsFromApi(
  accessToken: string,
  projectId = "aicode-consumers",
  preferredEndpoint = ANTIGRAVITY_ENDPOINT_DAILY
): Promise<OpencodeModelDefinitions> {
  const endpoints = [preferredEndpoint, ...ANTIGRAVITY_ENDPOINT_FALLBACKS.filter((e) => e !== preferredEndpoint)];
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...getAntigravityHeaders(),
  };

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}/v1internal:fetchAvailableModels`, {
        method: "POST",
        headers,
        body: JSON.stringify({ project: projectId }),
      });

      if (response.ok) {
        const data = (await response.json()) as FetchAvailableModelsApiResponse;
        if (data.models && Object.keys(data.models).length > 0) {
          const dynamicDefs = convertApiModelsToDefinitions(data.models);
          cachedDynamicDefinitions = dynamicDefs;
          return dynamicDefs;
        }
      }
    } catch {
      // Continue to next endpoint in fallback sequence
    }
  }

  // Fallback to verified seed catalog if network fails
  return getVerifiedModelDefinitions();
}

/**
 * Returns the verified model definitions catalog.
 */
export function getVerifiedModelDefinitions(): OpencodeModelDefinitions {
  if (cachedDynamicDefinitions) {
    return cachedDynamicDefinitions;
  }
  return convertApiModelsToDefinitions(VERIFIED_ANTIGRAVITY_MODELS);
}
