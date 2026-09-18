import { describe, expect, it } from "vitest";
import {
  VERIFIED_ANTIGRAVITY_MODELS,
  buildDynamicModelDefinition,
  convertApiModelsToDefinitions,
  formatModelDisplayName,
  deriveVariantsFromApiInfo,
  getVerifiedModelDefinitions,
} from "./detector";

describe("Antigravity Dynamic Model Detector", () => {
  it("contains verified live models from daily sandbox", () => {
    expect(VERIFIED_ANTIGRAVITY_MODELS["gemini-3.8-flash-tiered"]).toBeDefined();
    expect(VERIFIED_ANTIGRAVITY_MODELS["gemini-3.7-flash-tiered"]).toBeDefined();
    expect(VERIFIED_ANTIGRAVITY_MODELS["gemini-3.6-flash-tiered"]).toBeDefined();
    expect(VERIFIED_ANTIGRAVITY_MODELS["gemini-2.5-flash-thinking"]).toBeDefined();
    expect(VERIFIED_ANTIGRAVITY_MODELS["claude-opus-4-6-thinking"]).toBeDefined();
    expect(VERIFIED_ANTIGRAVITY_MODELS["claude-sonnet-4-6"]).toBeDefined();
  });

  it("dynamically sets limits for gemini-3.8-flash-tiered", () => {
    const info = VERIFIED_ANTIGRAVITY_MODELS["gemini-3.8-flash-tiered"]!;
    const def = buildDynamicModelDefinition("gemini-3.8-flash-tiered", info);

    expect(def.limit.context).toBe(1048576);
    expect(def.limit.output).toBe(65536);
    expect(def.variants).toEqual({
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    });
  });

  it("dynamically sets limits for claude-opus-4-6-thinking", () => {
    const info = VERIFIED_ANTIGRAVITY_MODELS["claude-opus-4-6-thinking"]!;
    const def = buildDynamicModelDefinition("claude-opus-4-6-thinking", info);

    expect(def.limit.context).toBe(250000);
    expect(def.limit.output).toBe(64000);
    expect(def.variants).toEqual({
      low: { thinkingConfig: { thinkingBudget: 8192 } },
      max: { thinkingConfig: { thinkingBudget: 32768 } },
    });
  });

  it("dynamically sets limits for gpt-oss-120b-medium", () => {
    const info = VERIFIED_ANTIGRAVITY_MODELS["gpt-oss-120b-medium"]!;
    const def = buildDynamicModelDefinition("gpt-oss-120b-medium", info);

    expect(def.limit.context).toBe(131072);
    expect(def.limit.output).toBe(32768);
  });

  it("formats model display names cleanly", () => {
    expect(formatModelDisplayName("gemini-3.8-flash-tiered")).toBe("Gemini 3.8 Flash (Antigravity)");
    expect(formatModelDisplayName("claude-opus-4-6-thinking")).toBe("Claude Opus 4.6 Thinking (Antigravity)");
  });

  it("exposes both canonical model IDs and aliases in definitions", () => {
    const definitions = getVerifiedModelDefinitions();
    expect(definitions["gemini-3.8-flash-tiered"]).toBeDefined();
    expect(definitions["antigravity-gemini-3.8-flash-tiered"]).toBeDefined();
    expect(definitions["gemini-2.5-flash-thinking"]).toBeDefined();
  });

  it("probes candidate models and discards non-working models", async () => {
    const { probeModel, probeAndFilterValidModels } = await import("./detector");

    // Mock fetch
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const bodyStr = typeof init?.body === "string" ? init.body : "";
        if (bodyStr.includes("working-model")) {
          return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "pong" }] } }] }), { status: 200 });
        }
        if (bodyStr.includes("rate-limited-model")) {
          return new Response(JSON.stringify({ error: { code: 429, message: "Individual quota reached" } }), { status: 429 });
        }
        return new Response(JSON.stringify({ error: { code: 400, message: "Invalid argument" } }), { status: 400 });
      };

      const probeOk = await probeModel("working-model", "fake-token");
      expect(probeOk.ok).toBe(true);
      expect(probeOk.status).toBe(200);

      const probe429 = await probeModel("rate-limited-model", "fake-token");
      expect(probe429.ok).toBe(false);
      expect(probe429.status).toBe(429);

      const filtered = await probeAndFilterValidModels(
        {
          "working-model": { maxTokens: 1000 },
          "rate-limited-model": { maxTokens: 1000 },
        },
        "fake-token",
        "test-proj",
      );

      expect(filtered["working-model"]).toBeDefined();
      expect(filtered["rate-limited-model"]).toBeUndefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
