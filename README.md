# Dart build_runner

English | [简体中文](https://github.com/xiankq/vscode-build-runner/blob/main/README_zh.md)

[![GitHub](https://img.shields.io/github/stars/xiankq/vscode-build-runner?style=flat&logo=github)](https://github.com/xiankq/vscode-build-runner)
[![VS Code](https://badgen.citizen4.eu/vs-marketplace/i/Kaiqun.build-runner?label=VS%20Code&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=Kaiqun.build-runner)
[![Open VSX](https://img.shields.io/open-vsx/dt/Kaiqun/build-runner?style=flat&logo=openvsx&label=Open%20VSX&color=E98300)](https://open-vsx.org/extension/Kaiqun/build-runner)

A VS Code extension to quickly run Flutter/Dart build_runner.

![screenshot](https://github.com/xiankq/vscode-build-runner/raw/main/static/screenshot.png)

## Features

- **Native Experience**: Works like the built-in NPM Scripts panel, right inside the Explorer sidebar.
- **Auto Discovery**: Automatically finds all packages that depend on `build_runner`.
- **Dart Workspace Support**: Automatically detects workspace roots and runs with `--workspace` flag for unified code generation. Requires build_runner >= 2.11.0.
- **Task Integration**: Uses VS Code's Task API so you get native terminal controls (stop, restart) and clear output.
- **Watch & Build**: Run `watch` or `build` independently and simultaneously for any package.
- **Smart Visibility**: The tree view only appears when build_runner projects are present.
- **One-Click Refresh**: Rescan the workspace anytime to pick up new or removed packages.

## Configuration

| Setting                 | Type    | Default                        | Description                                 |
| ----------------------- | ------- | ------------------------------ | ------------------------------------------- |
| `build_runner.fvm`      | boolean | `false`                        | Use FVM to run build_runner                 |
| `build_runner.args`     | string  | `--delete-conflicting-outputs` | Additional arguments passed to build_runner |
| `build_runner.excludes` | array   | `[]`                           | Glob patterns to exclude from scanning      |

## Usage

1. Open a Flutter or Dart project in VS Code.
2. The **BUILD RUNNER** panel appears in the Explorer sidebar when eligible packages are found.
3. Hover over any package and click the build or watch icon.
4. For Dart workspaces, the root package is labeled with `(workspace)` and runs with the `--workspace` flag automatically.

> Make sure Flutter / Dart environment variables are configured correctly. See the [build_runner documentation](https://github.com/dart-lang/build/tree/master/build_runner) for details. You can also create a `build.yaml` in each package to exclude unnecessary files and speed up compilation.

## Requirements

- Flutter / Dart SDK installed and available in your PATH.
- The [Dart extension](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code) for VS Code.
- Packages must declare `build_runner` as a dependency or dev dependency.

```yaml
# pubspec.yaml
dev_dependencies:
  build_runner: any
```

### Enabling Workspace Support

If you want to use Dart workspace support, define the workspace in your root `pubspec.yaml`:

```yaml
# pubspec.yaml
name: my_workspace
workspace:
  - packages/core
  - packages/ui

dev_dependencies:
  build_runner: ^2.11.0
```

Sub-packages should reference the workspace:

```yaml
# packages/core/pubspec.yaml
name: core
resolution: workspace

dev_dependencies:
  build_runner: any
```
