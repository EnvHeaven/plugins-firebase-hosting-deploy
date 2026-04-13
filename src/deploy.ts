import type {
  Diagnostic,
  PluginExecuteResult,
  PluginRuntimeContext,
  ResolvedPlan,
} from "envheaven";
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

  const channel = resolveChannel(plan.resolvedTarget, executionRaw);
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
