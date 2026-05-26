<br />

<p align="center">
  <a href="https://envheaven.com">
    <img src="./docs/readme/logo/envheaven-logo.svg" alt="EnvHeaven" width="96" />
  </a>

  <h1 align="center">EnvHeaven Firebase Hosting Deploy Plugin</h1>

  <p align="center">
    Environment hell, inverted.
  </p>

  <p align="center">
    <a href="#install">Install</a>
    ·
    <a href="#usage">Usage</a>
    ·
    <a href="#release-channels">Release Channels</a>
  </p>
</p>

<div align="center">

[![npm](https://img.shields.io/npm/v/@envheaven/plugins-firebase-hosting-deploy)](https://www.npmjs.com/package/@envheaven/plugins-firebase-hosting-deploy)
[![license](https://img.shields.io/npm/l/@envheaven/plugins-firebase-hosting-deploy)](#license)
[![plugin](https://img.shields.io/badge/envheaven-plugin-blue)](#usage)
[![Firebase Hosting](https://img.shields.io/badge/deploy-Firebase%20Hosting-orange)](#requirements)
[![status](https://img.shields.io/badge/status-experimental%200.x-orange)](#experimental-0x)

</div>

> **Experimental 0.x:** EnvHeaven is currently in experimental `0.x` development. APIs, CLI commands, plugin contracts, package names, and release behavior may change before `1.0.0`. Pin versions and read release notes before using it in production workflows.

## Install

| Channel | Install | Purpose |
|---|---|---|
| `release` | `npm install @envheaven/plugins-firebase-hosting-deploy@release` | recommended 0.x release track |
| `latest` | `npm install @envheaven/plugins-firebase-hosting-deploy` | npm default alias for the release track |
| `exp` | `npm install @envheaven/plugins-firebase-hosting-deploy@exp` | experimental builds with newer changes |

Install compatible `envheaven` host package in the same workflow.

## Usage

Run Firebase Hosting deploy workflows through EnvHeaven.

```jsonc
{
  "pluginPackage": "@envheaven/plugins-firebase-hosting-deploy",
  "Execution": {
    "cwd": "."
  }
}
```

## What it does

- Firebase CLI availability checks.
- Hosting project/site/public directory resolution.
- optional config materialization.
- `firebase deploy` execution through EnvHeaven.

## Requirements

Node.js `>=20`, EnvHeaven host package, Firebase CLI, Firebase auth, and an existing Hosting site.

## Release Channels

| Channel | Install | Purpose |
|---|---|---|
| `release` | `npm install @envheaven/plugins-firebase-hosting-deploy@release` | recommended 0.x release track |
| `latest` | `npm install @envheaven/plugins-firebase-hosting-deploy` | npm default alias for the release track |
| `exp` | `npm install @envheaven/plugins-firebase-hosting-deploy@exp` | experimental builds with newer changes |

`release` is the recommended 0.x track, not a stable API promise.

## Status

Experimental. Plugin contracts may change before EnvHeaven `1.0.0`.

## License

MIT, as declared in `package.json`.
