import test from "node:test";
import assert from "node:assert/strict";
import { inspect, metadata, plugin } from "../src/index";
import type { PluginRuntimeContext } from "envheaven";

function createContext(): PluginRuntimeContext {
  return {
    repoRoot: process.cwd(),
    platform: process.platform,
    diagnostics: [],
    async spawnExecution() {
      throw new Error("spawnExecution must not be called by the Firebase Hosting deploy stub.");
    },
  };
}

test("exports metadata, inspect, and plugin", async () => {
  assert.equal(metadata.packageName, "@envheaven/plugins/firebase-hosting-deploy");
  assert.equal(metadata.version, "0.1.0");
  assert.equal(metadata.stub, true);
  assert.equal(typeof inspect, "function");
  assert.equal(plugin.inspect, inspect);
  assert.equal("execute" in plugin, false);
});

test("inspect always reports not implemented in v0.1.0", async () => {
  const result = await inspect(createContext());

  assert.ok(result.diagnostics);
  assert.equal(result.diagnostics?.[0]?.severity, "error");
  assert.equal(result.diagnostics?.[0]?.code, "firebase-hosting-deploy-not-implemented");
  assert.match(result.diagnostics?.[0]?.message ?? "", /not implemented/i);
  assert.match(result.diagnostics?.[0]?.message ?? "", /0\.1\.0/);
});

test("inspect reports future prerequisites neutrally", async () => {
  const result = await inspect(createContext());
  const prerequisiteDiagnostic = result.diagnostics?.find(
    (diagnostic) => diagnostic.code === "firebase-hosting-deploy-future-prerequisites",
  );

  assert.ok(prerequisiteDiagnostic);
  assert.equal(prerequisiteDiagnostic?.severity, "info");
  assert.match(prerequisiteDiagnostic?.message ?? "", /future implementation/i);
  assert.match(prerequisiteDiagnostic?.message ?? "", /Firebase CLI/i);
  assert.match(prerequisiteDiagnostic?.message ?? "", /project initialization/i);
});
