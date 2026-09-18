import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  showAuthMenu,
  showAccountDetails,
  isTTY,
  type AccountInfo,
  type AccountStatus,
} from "./ui/auth-menu";
import { updateOpencodeConfig } from "./config/updater";
import { loadAccounts } from "./storage";
import { detectAndFilterModelsFromApi, detectModelsFromApi, getVerifiedModelDefinitions } from "./models/detector";

export async function promptProjectId(): Promise<string> {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question("Project ID (leave blank to use your default project): ");
    return answer.trim();
  } finally {
    rl.close();
  }
}

export async function promptAddAnotherAccount(currentCount: number): Promise<boolean> {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(`Add another account? (${currentCount} added) (y/n): `);
    const normalized = answer.trim().toLowerCase();
    return normalized === "y" || normalized === "yes";
  } finally {
    rl.close();
  }
}

export type LoginMode = "add" | "fresh" | "manage" | "check" | "verify" | "verify-all" | "cancel";

export interface ExistingAccountInfo {
  email?: string;
  index: number;
  addedAt?: number;
  lastUsed?: number;
  status?: AccountStatus;
  isCurrentAccount?: boolean;
  enabled?: boolean;
}

export interface LoginMenuResult {
  mode: LoginMode;
  deleteAccountIndex?: number;
  refreshAccountIndex?: number;
  toggleAccountIndex?: number;
  verifyAccountIndex?: number;
  verifyAll?: boolean;
  deleteAll?: boolean;
}

async function promptLoginModeFallback(existingAccounts: ExistingAccountInfo[]): Promise<LoginMenuResult> {
  const rl = createInterface({ input, output });
  try {
    console.log(`\n${existingAccounts.length} account(s) saved:`);
    for (const acc of existingAccounts) {
      const label = acc.email || `Account ${acc.index + 1}`;
      console.log(`  ${acc.index + 1}. ${label}`);
    }
    console.log("");

    while (true) {
      const answer = await rl.question("(a)dd new, (f)resh start, (c)heck quotas, (v)erify account, (va) verify all? [a/f/c/v/va]: ");
      const normalized = answer.trim().toLowerCase();

      if (normalized === "a" || normalized === "add") {
        return { mode: "add" };
      }
      if (normalized === "f" || normalized === "fresh") {
        return { mode: "fresh" };
      }
      if (normalized === "c" || normalized === "check") {
        return { mode: "check" };
      }
      if (normalized === "v" || normalized === "verify") {
        return { mode: "verify" };
      }
      if (normalized === "va" || normalized === "verify-all" || normalized === "all") {
        return { mode: "verify-all", verifyAll: true };
      }

      console.log("Please enter 'a', 'f', 'c', 'v', or 'va'.");
    }
  } finally {
    rl.close();
  }
}

export async function promptLoginMode(existingAccounts: ExistingAccountInfo[]): Promise<LoginMenuResult> {
  if (!isTTY()) {
    return promptLoginModeFallback(existingAccounts);
  }

  const accounts: AccountInfo[] = existingAccounts.map(acc => ({
    email: acc.email,
    index: acc.index,
    addedAt: acc.addedAt,
    lastUsed: acc.lastUsed,
    status: acc.status,
    isCurrentAccount: acc.isCurrentAccount,
    enabled: acc.enabled,
  }));

  console.log("");

  while (true) {
    const action = await showAuthMenu(accounts);

    switch (action.type) {
      case "add":
        return { mode: "add" };

      case "check":
        return { mode: "check" };

      case "verify":
        return { mode: "verify" };

      case "verify-all":
        return { mode: "verify-all", verifyAll: true };

      case "select-account": {
        const accountAction = await showAccountDetails(action.account);
        if (accountAction === "delete") {
          return { mode: "add", deleteAccountIndex: action.account.index };
        }
        if (accountAction === "refresh") {
          return { mode: "add", refreshAccountIndex: action.account.index };
        }
        if (accountAction === "toggle") {
          return { mode: "manage", toggleAccountIndex: action.account.index };
        }
        if (accountAction === "verify") {
          return { mode: "verify", verifyAccountIndex: action.account.index };
        }
        continue;
      }

      case "delete-all":
        return { mode: "fresh", deleteAll: true };

      case "configure-models": {
        console.log("\n🔍 Detecting and probing available models from Antigravity API...");
        let dynamicModels: Record<string, unknown> | undefined;
        try {
          const stored = await loadAccounts();
          const activeAcc = stored?.accounts[stored.activeIndex ?? 0] ?? stored?.accounts[0];
          if (activeAcc?.refreshToken) {
            const { refreshAccessToken } = await import("./token");
            const refreshed = await refreshAccessToken(
              { type: "oauth", refresh: activeAcc.refreshToken },
              {} as any,
              "antigravity"
            );
            if (refreshed?.access) {
              const projectId = activeAcc.projectId || "aicode-consumers";
              console.log(`Connecting to unrestricted endpoint with project [${projectId}]...`);
              dynamicModels = await detectAndFilterModelsFromApi(refreshed.access, projectId, {
                shouldProbe: true,
                onProgress: (modelId, ok, status) => {
                  if (ok) {
                    console.log(`  ✓ ${modelId} (${status ?? 200} OK)`);
                  } else {
                    console.log(`  ✗ ${modelId} (excluded: ${status ?? "incompatible"})`);
                  }
                },
              });
              console.log(`\n✓ Verified ${Object.keys(dynamicModels).length} working model definitions for your account.`);
            }
          }
        } catch (err) {
          console.warn("Dynamic probing error, falling back to verified consumer catalog:", err);
        }

        if (!dynamicModels) {
          dynamicModels = getVerifiedModelDefinitions();
        }

        const result = await updateOpencodeConfig({ models: dynamicModels, syncAntigravityProvider: true });
        if (result.success) {
          console.log(`\n✓ Models configured in ${result.configPath} for providers "google" and "antigravity"\n`);
        } else {
          console.log(`\n✗ Failed to configure models: ${result.error}\n`);
        }
        continue;
      }

      case "cancel":
        return { mode: "cancel" };
    }
  }
}

export { isTTY } from "./ui/auth-menu";
export type { AccountStatus } from "./ui/auth-menu";
