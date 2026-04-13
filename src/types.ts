export interface FirebaseHostingDeployPluginMetadata {
  packageName: string;
  version: string;
  pluginId: string;
  kind: "deploy";
  description: string;
}

export interface FirebaseHostingDeployInspectDetails extends Record<string, unknown> {
  implemented: boolean;
  packageName: string;
  version: string;
  firebaseCliAvailable: boolean;
  firebaseCliVersion: string | null;
  projectId: string | null;
  site: string | null;
}
