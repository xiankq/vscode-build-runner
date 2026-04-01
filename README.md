# A VS Code extension to quickly run Flutter/Dart build_runner

English | [简体中文](https://github.com/xiankaiqun/vscode-build-runner/blob/main/README_zh.md)

## Inspiration

Inspired by the NPM Scripts tool that comes with VS Code.

## Features

- Experience almost identical to the built-in `NPM Scripts` view.
- Supports running build_runner for multiple independent packages across multiple workspaces (monorepo).
- Automatically detects packages with build_runner dependencies in the workspace.
- Uses the VS Code Task API for a native terminal experience with control buttons (stop, restart).
- Supports running both build_runner watch and build simultaneously.
- Auto-hides the tree view when no build_runner projects are detected.
- Refresh button to rescan the workspace for build_runner projects.

## Configuration

| Setting                 | Type    | Default                        | Description                                 |
| ----------------------- | ------- | ------------------------------ | ------------------------------------------- |
| `build_runner.fvm`      | boolean | `false`                        | Use FVM to run build_runner                 |
| `build_runner.args`     | string  | `--delete-conflicting-outputs` | Additional arguments passed to build_runner |
| `build_runner.excludes` | array   | `[]`                           | Glob patterns to exclude from scanning      |

## Usage

- Ensure that the Flutter/Dart environment variables are correctly configured.
- Refer to the [build_runner](https://github.com/dart-lang/build/tree/master/build_runner) documentation. If necessary, configure `build.yaml` for each package to exclude unnecessary files and improve compilation speed.
- Closing the corresponding terminal will stop the build_runner process.

## Requirements

The extension automatically detects `pubspec.yaml` files that include build_runner as a dependency.

```yaml
# pubspec.yaml
# ...
dev_dependencies:
  build_runner: any
  # or
dependencies:
  build_runner: any
  # ...
```

## Screenshot

![screenshot.png](https://ftp.bmp.ovh/imgs/2021/04/070cb16d017ee66c.png)
