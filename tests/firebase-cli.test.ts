import test from "node:test";
import assert from "node:assert/strict";
import { metadata, plugin } from "../src/index";
import {
  buildDeployArgs,
    resolveChannel,
  resolveFirebaseProject,
  resolvePublicDir,
} from "../src/firebase-cli";

test("exports live plugin metadata", () => {
  assert.equal(metadata.packageName, "@envheaven/plugins-firebase-hosting-deploy");
  assert.equal(metadata.version, "0.2.0");
  assert.equal(metadata.kind, "deploy");
  assert.equal(typeof plugin.inspect, "function");
  assert.equal(typeof plugin.execute, "function");
});

test("buildDeployArgs uses supported firebase deploy flags", () => {
  assert.deepEqual(
    buildDeployArgs("jd-eh-ws-01", "jd-eh-ws-01-development-01", null, "build/browser"),
    [
      "deploy",
      "--only",
      "hosting",
      "--project",
      "jd-eh-ws-01",
      "--non-interactive",
    ],
  );
});

test("buildDeployArgs maps non-live targets to channel deploy", () => {
  assert.deepEqual(
    buildDeployArgs("jd-eh-ws-01", "jd-eh-ws-01-development-01", "development", "build/browser"),
    [
      "hosting:channel:deploy",
      "development",
      "--project",
      "jd-eh-ws-01",
      "--non-interactive",
    ],
  );
});

test("resolve helpers honor execution config before env", () => {
  assert.deepEqual(
    resolveFirebaseProject(
      {
        FIREBASE_PROJECT: "env-project",
        FIREBASE_HOSTING_SITE: "env-site",
      },
      {
        firebaseProject: "config-project",
        firebaseSite: "config-site",
      },
    ),
    {
      projectId: "config-project",
      site: "config-site",
      diagnostics: [],
    },
  );

  assert.equal(resolveChannel("development-01", null, undefined), "development");
  assert.equal(resolveChannel("production-01", null, undefined), "live");
  assert.equal(resolveChannel("development-01", "jd-eh-ws-01-development-01", undefined), "live");
  assert.equal(resolveChannel("development-01", "jd-eh-ws-01-development-01", { firebaseChannel: "development" }), "development");
  assert.equal(resolvePublicDir({ publicDir: "build/browser" }), "build/browser");
});
