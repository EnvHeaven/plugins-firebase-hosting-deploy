import type {
  Diagnostic,
  EnvHeavenPlugin,
  PluginInspectResult,
  PluginRuntimeContext,
} from "envheaven";
import type {
  FirebaseHostingDeployInspectDetails,
  FirebaseHostingDeployPluginMetadata,
} from "./types";

export type {
  FirebaseHostingDeployInspectDetails,
  FirebaseHostingDeployPluginMetadata,
} from "./types";

export const metadata: FirebaseHostingDeployPluginMetadata = {
  packageName: "@envheaven/plugins/firebase-hosting-deploy",
  version: "0.1.0",
  pluginId: "firebase-hosting-deploy",
  kind: "deploy",
  stub: true,
  description: "Stub EnvHeaven plugin that reports Firebase Hosting deploy as not implemented in v0.1.0.",
};

const futurePrerequisites = [
  "Firebase CLI installation",
  "Firebase project initialization",
] as const;

export async function inspect(_context: PluginRuntimeContext): Promise<PluginInspectResult> {
  const diagnostics: Diagnostic[] = [
    {
      severity: "error",
      code: "firebase-hosting-deploy-not-implemented",
      message: "Firebase Hosting deploy is not implemented in @envheaven/plugins/firebase-hosting-deploy v0.1.0.",
      details: {
        packageName: metadata.packageName,
        version: metadata.version,
        stub: metadata.stub,
      },
    },
    {
      severity: "info",
      code: "firebase-hosting-deploy-future-prerequisites",
      message:
        "Future implementation is expected to require Firebase CLI availability and Firebase project initialization.",
      details: {
        futurePrerequisites: [...futurePrerequisites],
      },
    },
  ];

  const details: FirebaseHostingDeployInspectDetails = {
    implemented: false,
    packageName: metadata.packageName,
    version: metadata.version,
    futurePrerequisites: [...futurePrerequisites],
  };

  return {
    diagnostics,
    details: details as Record<string, unknown>,
  };
}

export const plugin: EnvHeavenPlugin = {
  inspect,
};
