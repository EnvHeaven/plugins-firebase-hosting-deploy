export interface FirebaseHostingDeployPluginMetadata {
  packageName: string;
  version: string;
  pluginId: string;
  kind: "deploy";
  stub: true;
  description: string;
}

export interface FirebaseHostingDeployInspectDetails extends Record<string, unknown> {
  implemented: false;
  packageName: string;
  version: string;
  futurePrerequisites: string[];
}
