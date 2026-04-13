import type { Diagnostic, SpawnRequest } from "envheaven";

export interface FirebaseCliCheckResult {
  available: boolean;
  version: string | null;
  diagnostics: Diagnostic[];
}

export async function checkFirebaseCli(
  spawnExecution: (request: SpawnRequest) => Promise<{ exitCode: number; signal: NodeJS.Signals | null }>,
): Promise<FirebaseCliCheckResult> {
  const diagnostics: Diagnostic[] = [];

  try {
    let stdout = "";
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const capture = (chunk: string | Uint8Array) => {
      stdout += String(chunk);
      return true;
    };
    process.stdout.write = capture as typeof process.stdout.write;

    const result = await spawnExecution({
      command: "firebase",
      args: ["--version"],
      env: {},
    });

    process.stdout.write = originalStdoutWrite;

    if (result.exitCode === 0) {
      const version = stdout.trim().split("\n").pop()?.trim() ?? null;
      return { available: true, version, diagnostics };
    }

    diagnostics.push({
      severity: "error",
      code: "firebase-cli-not-working",
      message: `Firebase CLI exited with code ${String(result.exitCode)}.`,
    });
    return { available: false, version: null, diagnostics };
  } catch {
    diagnostics.push({
      severity: "error",
      code: "firebase-cli-not-found",
      message: "Firebase CLI is not installed or not in PATH. Install with: npm install -g firebase-tools",
    });
    return { available: false, version: null, diagnostics };
  }
}

export interface FirebaseProjectInfo {
  projectId: string | null;
  site: string | null;
  diagnostics: Diagnostic[];
}

export function resolveFirebaseProject(
  env: Record<string, string>,
  executionRaw: Record<string, unknown> | undefined,
): FirebaseProjectInfo {
  const diagnostics: Diagnostic[] = [];

  const projectId =
    (executionRaw?.["firebaseProject"] as string) ??
    env["FIREBASE_PROJECT"] ??
    env["GCLOUD_PROJECT"] ??
    null;

  const site =
    (executionRaw?.["firebaseSite"] as string) ??
    env["FIREBASE_HOSTING_SITE"] ??
    null;

  if (!projectId) {
    diagnostics.push({
      severity: "warning",
      code: "firebase-project-not-configured",
      message:
        "No Firebase project configured. Set FIREBASE_PROJECT env var or firebaseProject in execution config.",
    });
  }

  return { projectId, site, diagnostics };
}

export function buildDeployArgs(
  projectId: string | null,
  site: string | null,
  channel: string | null,
  publicDir: string | null,
): string[] {
  const args = ["deploy", "--only", "hosting"];

  if (projectId) {
    args.push("--project", projectId);
  }

  if (channel && channel !== "live") {
    args.splice(0, args.length);
    args.push("hosting:channel:deploy", channel);
    if (projectId) {
      args.push("--project", projectId);
    }
  }

  if (site) {
    args.push("--site", site);
  }

  args.push("--non-interactive");

  return args;
}

export function resolveChannel(
  resolvedTarget: string,
  executionRaw: Record<string, unknown> | undefined,
): string | null {
  const explicit =
    (executionRaw?.["firebaseChannel"] as string) ?? null;
  if (explicit) return explicit;

  switch (resolvedTarget) {
    case "production":
    case "production-01":
      return "live";
    case "beta":
    case "beta-01":
      return "beta";
    case "development":
    case "development-01":
      return "development";
    default:
      return null;
  }
}

export function resolvePublicDir(
  executionRaw: Record<string, unknown> | undefined,
): string | null {
  return (executionRaw?.["publicDir"] as string) ?? null;
}
