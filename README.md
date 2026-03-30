# @envheaven/plugins-firebase-hosting-deploy

`@envheaven/plugins-firebase-hosting-deploy@0.1.0` is an intentionally minimal stub package for EnvHeaven.

## v0.1.0 Status

This package does not perform Firebase Hosting deployment in `0.1.0`.

It currently exports:

- plugin metadata
- a minimal `inspect()` API
- a plugin object that always reports deploy as not implemented

## Not Implemented in v0.1.0

- real Firebase Hosting deployment
- Firebase CLI installation or invocation
- Firebase authentication
- Firebase project discovery or initialization

## Future Prerequisites

Future versions are expected to require:

- Firebase CLI to be installed and available
- a Firebase project to be initialized for the target repository

`0.1.0` does not check for either prerequisite. It only reports them as neutral diagnostics for future implementation guidance.

## Installation

```bash
npm install @envheaven/plugins-firebase-hosting-deploy
```

When used with EnvHeaven, install a compatible `envheaven` host package as well.

## Usage

```ts
import {
  inspect,
  metadata,
  plugin,
} from "@envheaven/plugins-firebase-hosting-deploy";

console.log(metadata);

const result = await inspect({
  repoRoot: process.cwd(),
  platform: process.platform,
  diagnostics: [],
  spawnExecution: async () => ({ exitCode: 1, signal: null }),
});

console.log(result.diagnostics);
console.log(plugin.inspect === inspect);
```

## API

### `metadata`

Static metadata describing this package as a Firebase Hosting deploy stub plugin for EnvHeaven.

### `inspect(context)`

Returns deterministic diagnostics stating that deploy is not implemented in `0.1.0` and that future implementation is expected to require Firebase CLI and Firebase project initialization.

### `plugin`

EnvHeaven plugin object exposing only `inspect()`.

## Notes

This package is intentionally tiny and publishable. It exists to reserve the package contract for later implementation without implying deployment support in `0.1.0`.
