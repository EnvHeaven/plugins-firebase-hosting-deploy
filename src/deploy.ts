import type {
  Diagnostic,
  PluginExecuteResult,
  PluginRuntimeContext,
  ResolvedPlan,
} from "envheaven";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  buildDeployArgs,
  checkFirebaseCli,
  resolveChannel,
  resolveFirebaseProject,
  resolvePublicDir,
} from "./firebase-cli";

export async function executeFirebaseDeploy(
  plan: ResolvedPlan,
  context: PluginRuntimeContext,
): Promise<PluginExecuteResult> {
  const diagnostics: Diagnostic[] = [];
  const executionRaw = plan.execution?.raw;

  const cliCheck = await checkFirebaseCli(context.spawnExecution);
  diagnostics.push(...cliCheck.diagnostics);

  if (!cliCheck.available) {
    return { exitCode: 1, diagnostics };
  }

  diagnostics.push({
    severity: "info",
    code: "firebase-cli-version",
    message: `Firebase CLI version: ${cliCheck.version ?? "unknown"}`,
  });

  const projectInfo = resolveFirebaseProject(
    plan.execution?.env ?? {},
    executionRaw,
  );
  diagnostics.push(...projectInfo.diagnostics);

  const channel = resolveChannel(plan.resolvedTarget, projectInfo.site, executionRaw);
  const publicDir = resolvePublicDir(executionRaw);

  diagnostics.push({
    severity: "info",
    code: "firebase-deploy-config",
    message: `Project: ${projectInfo.projectId ?? "(auto-detect)"}, Site: ${projectInfo.site ?? "(default)"}, Channel: ${channel ?? "live"}, Public: ${publicDir ?? "(firebase.json)"}`,
  });

  const deployArgs = buildDeployArgs(
    projectInfo.projectId,
    projectInfo.site,
    channel,
    publicDir,
  );

  const cwd = plan.execution?.cwd ?? context.repoRoot;
  diagnostics.push(...(await materializeFirebaseWorkspace(cwd, projectInfo.projectId, projectInfo.site, publicDir)));

  diagnostics.push({
    severity: "info",
    code: "firebase-deploy-command",
    message: `Running: firebase ${deployArgs.join(" ")} (cwd: ${cwd})`,
  });

  const result = await context.spawnExecution({
    command: "firebase",
    args: deployArgs,
    env: {
      ...(plan.execution?.env ?? {}),
      ...(publicDir ? { FIREBASE_HOSTING_PUBLIC: publicDir } : {}),
    },
    cwd,
  });

  if (result.exitCode === 0) {
    diagnostics.push({
      severity: "info",
      code: "firebase-deploy-success",
      message: `Firebase Hosting deploy completed successfully.`,
    });
  } else {
    diagnostics.push({
      severity: "error",
      code: "firebase-deploy-failed",
      message: `Firebase deploy exited with code ${String(result.exitCode)}.`,
    });
  }

  return {
    exitCode: result.exitCode,
    diagnostics,
    details: {
      projectId: projectInfo.projectId,
      site: projectInfo.site,
      channel,
      publicDir,
      firebaseCliVersion: cliCheck.version,
    },
  };
}

async function materializeFirebaseWorkspace(
  cwd: string,
  projectId: string | null,
  site: string | null,
  publicDir: string | null,
): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  const firebaseJsonPath = path.join(cwd, "firebase.json");
  const firebaseRcPath = path.join(cwd, ".firebaserc");

  if (site || publicDir) {
    try {
      const raw = await fs.readFile(firebaseJsonPath, "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      let changed = false;

      if (parsed.hosting && !Array.isArray(parsed.hosting) && typeof parsed.hosting === "object") {
        parsed.hosting = {
          ...(parsed.hosting as Record<string, unknown>),
          ...(site ? { site } : {}),
          ...(publicDir ? { public: publicDir } : {}),
        };
        changed = true;
      } else if (Array.isArray(parsed.hosting) && parsed.hosting.length === 1) {
        const first = parsed.hosting[0];
        if (first && typeof first === "object") {
          parsed.hosting = [
            {
              ...(first as Record<string, unknown>),
              ...(site ? { site } : {}),
              ...(publicDir ? { public: publicDir } : {}),
            },
          ];
          changed = true;
        }
      }

      if (changed) {
        await fs.writeFile(firebaseJsonPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
        diagnostics.push({
          severity: "info",
          code: "firebase-config-hosting-materialized",
          message: `Applied Firebase Hosting config in ${firebaseJsonPath}.`,
        });
      }
    } catch (error) {
      diagnostics.push({
        severity: "warning",
        code: "firebase-config-site-materialize-failed",
        message: `Failed to apply firebaseSite to firebase.json: ${error instanceof Error ? error.message : "unknown error"}`,
      });
    }
  }

  if (projectId) {
    try {
      let parsed: Record<string, unknown> = {};
      try {
        const raw = await fs.readFile(firebaseRcPath, "utf8");
        parsed = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        parsed = {};
      }

      parsed.projects = {
        ...((parsed.projects && typeof parsed.projects === "object") ? parsed.projects as Record<string, unknown> : {}),
        default: projectId,
      };

      await fs.writeFile(firebaseRcPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
      diagnostics.push({
        severity: "info",
        code: "firebase-config-project-materialized",
        message: `Applied Firebase project "${projectId}" in ${firebaseRcPath}.`,
      });
    } catch (error) {
      diagnostics.push({
        severity: "warning",
        code: "firebase-config-project-materialize-failed",
        message: `Failed to apply firebaseProject to .firebaserc: ${error instanceof Error ? error.message : "unknown error"}`,
      });
    }
  }

  return diagnostics;
}
