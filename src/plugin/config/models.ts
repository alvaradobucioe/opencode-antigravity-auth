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

const DEFAULT_MODALITIES: ModelModalities = {
  input: ["text", "image", "pdf"],
  output: ["text"],
};

export const OPENCODE_MODEL_DEFINITIONS: OpencodeModelDefinitions = {
  "antigravity-gemini-3.8-flash": {
    name: "Gemini 3.8 Flash (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
  },
  "antigravity-gemini-3.7-flash": {
    name: "Gemini 3.7 Flash (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
  },
  "antigravity-gemini-3.6-flash": {
    name: "Gemini 3.6 Flash (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
  },
  "antigravity-gemini-3.5-flash-lite": {
    name: "Gemini 3.5 Flash Lite (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
  },
  "antigravity-gemini-2.5-flash-thinking": {
    name: "Gemini 2.5 Flash Thinking (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
  },
  "antigravity-gemini-3-flash-agent": {
    name: "Gemini 3 Flash Agent (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
  },
  "antigravity-gemini-pro-agent": {
    name: "Gemini Pro Agent (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
  },
  "antigravity-gemini-3.1-flash-image": {
    name: "Gemini 3.1 Flash Image (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
  },
  "antigravity-gpt-oss-120b-medium": {
    name: "GPT-OSS 120B Medium (Antigravity)",
    limit: { context: 131072, output: 16384 },
    modalities: DEFAULT_MODALITIES,
  },
  "tab_flash_lite_preview": {
    name: "Tab Flash Lite Preview (Antigravity)",
    limit: { context: 16384, output: 4096 },
    modalities: DEFAULT_MODALITIES,
  },
  "antigravity-gemini-3-pro": {
    name: "Gemini 3 Pro (Antigravity)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    },
  },
  "antigravity-gemini-3.1-pro": {
    name: "Gemini 3.1 Pro (Antigravity)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    },
  },
  "antigravity-gemini-3-flash": {
    name: "Gemini 3 Flash (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
  },
  "antigravity-claude-sonnet-4-6": {
    name: "Claude Sonnet 4.6 (Antigravity)",
    limit: { context: 250000, output: 64000 },
    modalities: DEFAULT_MODALITIES,
  },
  "antigravity-claude-opus-4-6-thinking": {
    name: "Claude Opus 4.6 Thinking (Antigravity)",
    limit: { context: 250000, output: 64000 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingConfig: { thinkingBudget: 8192 } },
      max: { thinkingConfig: { thinkingBudget: 32768 } },
    },
  },
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
  },
  "gemini-3-flash-preview": {
    name: "Gemini 3 Flash Preview",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
  },
  "gemini-3-pro-preview": {
    name: "Gemini 3 Pro Preview",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
  },
  "gemini-3.1-pro-preview": {
    name: "Gemini 3.1 Pro Preview",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
  },
  "gemini-3.1-pro-preview-customtools": {
    name: "Gemini 3.1 Pro Preview Custom Tools",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
  },
};
