<p align="center">
  <a href="https://envheaven.com">
    <img src="./docs/readme/logo/envheaven-logo.png" alt="EnvHeaven" width="96" />
  </a>
</p>

# @envheaven/plugins-firebase-hosting-deploy

> EnvHeaven plugin for Firebase Hosting deploy workflows.

[![npm version](https://img.shields.io/npm/v/@envheaven/plugins-firebase-hosting-deploy)](https://www.npmjs.com/package/@envheaven/plugins-firebase-hosting-deploy)
[![license](https://img.shields.io/npm/l/@envheaven/plugins-firebase-hosting-deploy)](https://www.npmjs.com/package/@envheaven/plugins-firebase-hosting-deploy)

> **Experimental 0.x:** EnvHeaven is currently in experimental `0.x` development. APIs, CLI commands, plugin contracts, package names, and release behavior may change before `1.0.0`. Pin versions and read release notes before using it in production workflows.

## What it does

This plugin lets EnvHeaven inspect and execute Firebase Hosting deploy plans.

It can:

- check Firebase CLI availability.
- resolve Firebase project, site, public directory, and channel settings from the execution context.
- materialize Firebase Hosting config into `firebase.json` and `.firebaserc` when needed.
- run `firebase deploy` through EnvHeaven's execution context.
- report structured diagnostics back to EnvHeaven.

It is not a full Firebase management platform. It focuses on Hosting deploy execution.

## Install

```sh
npm install @envheaven/plugins-firebase-hosting-deploy
```

Install the EnvHeaven host package too:

```sh
npm install envheaven
```

## Use

Example EnvHeaven execution metadata can point at this package:

```jsonc
{
  "pluginPackage": "@envheaven/plugins-firebase-hosting-deploy",
  "Execution": {
    "cwd": "./artifacts/web-site-01-fe-01",
    "env": {
      "FIREBASE_PROJECT_ID": "my-firebase-project",
      "FIREBASE_HOSTING_SITE": "my-hosting-site",
      "FIREBASE_HOSTING_PUBLIC": "build/browser"
    }
  }
}
```

Then run the matching EnvHeaven deploy target from the env repo:

```sh
envheaven deploy development
envheaven deploy production
```

## Requirements

- Node.js `>=20`.
- EnvHeaven host package.
- Firebase CLI available in `PATH`.
- Firebase authentication configured for the target machine/session.
- A Firebase project and Hosting site configured for the target workflow.

## Current limitations

- The plugin delegates deployment to the Firebase CLI.
- It does not provision Firebase projects or Hosting sites.
- It does not claim a stable API before EnvHeaven `1.0.0`.
- Public README/docs are still being consolidated.

## Related

- [`envheaven`](https://www.npmjs.com/package/envheaven)
- [`@envheaven/plugins-nodejs-pnpm`](https://www.npmjs.com/package/@envheaven/plugins-nodejs-pnpm)
- [`@envheaven/plugins-offiline-web-ui`](https://www.npmjs.com/package/@envheaven/plugins-offiline-web-ui)

## License

MIT, as declared in `package.json`.
