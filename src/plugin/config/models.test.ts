import { describe, expect, it } from "vitest";

import { OPENCODE_MODEL_DEFINITIONS } from "./models";

const getModel = (name: string) => {
  const model = OPENCODE_MODEL_DEFINITIONS[name];
  if (!model) {
    throw new Error(`Missing model definition for ${name}`);
  }
  return model;
};

describe("OPENCODE_MODEL_DEFINITIONS", () => {
  it("includes the full set of configured models", () => {
    const modelNames = Object.keys(OPENCODE_MODEL_DEFINITIONS).sort();

    expect(modelNames).toEqual([
      "antigravity-claude-opus-4-6-thinking",
      "antigravity-claude-sonnet-4-6",
      "antigravity-gemini-2.5-flash-thinking",
      "antigravity-gemini-3-flash",
      "antigravity-gemini-3-flash-agent",
      "antigravity-gemini-3-pro",
      "antigravity-gemini-3.1-flash-image",
      "antigravity-gemini-3.1-pro",
      "antigravity-gemini-3.5-flash-lite",
      "antigravity-gemini-3.6-flash",
      "antigravity-gemini-3.7-flash",
      "antigravity-gemini-3.8-flash",
      "antigravity-gemini-pro-agent",
      "antigravity-gpt-oss-120b-medium",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-3-flash-preview",
      "gemini-3-pro-preview",
      "gemini-3.1-pro-preview",
      "gemini-3.1-pro-preview-customtools",
      "tab_flash_lite_preview",
    ]);
  });

  it("defines Gemini 3 variants for Antigravity models", () => {
    expect(getModel("antigravity-gemini-3-pro").variants).toEqual({
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    });

    expect(getModel("antigravity-gemini-3.1-pro").variants).toEqual({
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    });

    expect(getModel("antigravity-gemini-3-flash").variants).toEqual({
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    });
  });

  it("defines thinking budget variants for Claude thinking models", () => {
    expect(getModel("antigravity-claude-opus-4-6-thinking").variants).toEqual({
      low: { thinkingConfig: { thinkingBudget: 8192 } },
      max: { thinkingConfig: { thinkingBudget: 32768 } },
    });
  });

  it("calculates model limits dynamically", () => {
    expect(getModel("antigravity-gemini-3.8-flash").limit).toEqual({ context: 1048576, output: 65536 });
    expect(getModel("antigravity-claude-opus-4-6-thinking").limit).toEqual({ context: 250000, output: 64000 });
    expect(getModel("antigravity-gpt-oss-120b-medium").limit).toEqual({ context: 131072, output: 16384 });
    expect(getModel("tab_flash_lite_preview").limit).toEqual({ context: 16384, output: 4096 });
    expect(getModel("antigravity-gemini-3-pro").limit).toEqual({ context: 1048576, output: 65535 });
  });

  it("calculates modalities dynamically", () => {
    expect(getModel("antigravity-gemini-3.8-flash").modalities).toEqual({
      input: ["text", "image", "pdf"],
      output: ["text"],
    });
    expect(getModel("antigravity-gemini-3.1-flash-image").modalities).toEqual({
      input: ["text", "image", "pdf"],
      output: ["image", "text"],
    });
  });
});
