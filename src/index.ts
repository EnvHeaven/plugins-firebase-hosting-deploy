import type {
  Diagnostic,
  EnvHeavenPlugin,
  PluginExecuteResult,
  PluginInspectResult,
  PluginRuntimeContext,
  ResolvedPlan,
} from "envheaven";
import { executeFirebaseDeploy } from "./deploy";
import { checkFirebaseCli, resolveFirebaseProject } from "./firebase-cli";
import type {
  FirebaseHostingDeployInspectDetails,
  FirebaseHostingDeployPluginMetadata,
} from "./types";

export type {
  FirebaseHostingDeployInspectDetails,
  FirebaseHostingDeployPluginMetadata,
} from "./types";

export const metadata: FirebaseHostingDeployPluginMetadata = {
  packageName: "@envheaven/plugins-firebase-hosting-deploy",
  version: "0.2.0",
  pluginId: "firebase-hosting-deploy",
  kind: "deploy",
  description:
    "EnvHeaven plugin for deploying to Firebase Hosting. " +
    "Supports live and preview channel deployments with project auto-detection.",
};

export async function inspect(
  context: PluginRuntimeContext,
): Promise<PluginInspectResult> {
  const diagnostics: Diagnostic[] = [];

  const cliCheck = await checkFirebaseCli(context.spawnExecution);
  diagnostics.push(...cliCheck.diagnostics);

  const projectInfo = resolveFirebaseProject(
    process.env as Record<string, string>,
    undefined,
  );
  diagnostics.push(...projectInfo.diagnostics);

  if (cliCheck.available) {
    diagnostics.push({
      severity: "info",
      code: "firebase-hosting-deploy-ready",
      message: `Firebase Hosting deploy is ready (CLI v${cliCheck.version ?? "unknown"}).`,
    });
  }

  const details: FirebaseHostingDeployInspectDetails = {
    implemented: true,
    packageName: metadata.packageName,
    version: metadata.version,
    firebaseCliAvailable: cliCheck.available,
    firebaseCliVersion: cliCheck.version,
    projectId: projectInfo.projectId,
    site: projectInfo.site,
  };

  return {
    diagnostics,
    details: details as Record<string, unknown>,
  };
}

export async function execute(
  plan: ResolvedPlan,
  context: PluginRuntimeContext,
): Promise<PluginExecuteResult> {
  return executeFirebaseDeploy(plan, context);
}

export const plugin: EnvHeavenPlugin = {
  inspect,
  execute,
};
