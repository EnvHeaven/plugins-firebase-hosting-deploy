import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { executeFirebaseDeploy } from "../src/deploy";
import type { PluginRuntimeContext, ResolvedPlan } from "envheaven";

test("executeFirebaseDeploy materializes index.html from index.csr.html when missing", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "envheaven-firebase-plugin-test-"));
  const publicDir = path.join(tempRoot, "build", "browser");
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(
    path.join(tempRoot, "firebase.json"),
    `${JSON.stringify({ hosting: { public: "build/browser", rewrites: [{ source: "**", destination: "/index.html" }] } }, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(path.join(publicDir, "index.csr.html"), "<html>csr</html>\n", "utf8");

  const plan: ResolvedPlan = {
    kind: "deploy",
    requestedTarget: "beta-01",
    resolvedTarget: "beta-01",
    targetResolutionTrace: [],
    mergeOrder: [],
    selectedArtifacts: [],
    diagnostics: [],
    trace: [],
    repoExecutions: [],
    artifactExecutions: [],
    execution: {
      command: undefined,
      args: [],
      env: {},
      cwd: tempRoot,
      raw: {
        firebaseProject: "jd-eh-ws-01",
        firebaseSite: "jd-eh-ws-01-beta-01",
        publicDir: "build/browser",
      },
    },
    pluginPackage: "@envheaven/plugins-firebase-hosting-deploy",
    resolvedModel: {},
  };

  const context: PluginRuntimeContext = {
    repoRoot: tempRoot,
    platform: process.platform,
    diagnostics: [],
    async spawnExecution(request) {
      if (request.command === "firebase" && request.args[0] === "--version") {
        process.stdout.write("15.13.0\n");
        return { exitCode: 0, signal: null };
      }
      return { exitCode: 0, signal: null };
    },
  };

  const result = await executeFirebaseDeploy(plan, context);
  assert.equal(result.exitCode, 0);
  assert.equal(await fs.readFile(path.join(publicDir, "index.html"), "utf8"), "<html>csr</html>\n");
  assert.ok(
    result.diagnostics?.some((entry) => entry.code === "firebase-browser-index-materialized"),
  );
});
