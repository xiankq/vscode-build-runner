# Quickly run the VSCode plugin of Flutter/Dart build_runner

English | [简体中文](https://github.com/xiankaiqun/vscode-build-runner/blob/master/README_zh.md)

## Inspiration

Inspired by the NPM script tool that comes with VSCode.

## Features

- High-quality experience almost the same as `VSCode NPM script`.
- Support build_runner operation of multiple independent packages under multiple workspaces (monorepo).
- Automatically identify Packages with build_runner dependencies in the workspace.
- Use VSCode Task API for native terminal experience with control buttons (stop, restart).
- Support build_runner watch/build at the same time.
- Auto-hide tree view when no projects with build_runner are detected.
- Refresh button to rescan workspace for build_runner projects.

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `build_runner.fvm` | boolean | `false` | Use FVM to run build_runner |
| `build_runner.args` | string | `--delete-conflicting-outputs` | Additional arguments passed to build_runner |
| `build_runner.excludes` | array | `[]` | Glob patterns to exclude from scanning |

## Usage

- You must configure the Flutter/dart environment variables correctly.
- Read [build_runner](https://github.com/dart-lang/build/tree/master/build_runner) related documents. When necessary, you need to configure `build.yaml` for each package to be run to ignore some unnecessary files to improve compilation speed.
- Closing the corresponding terminal will trigger build_runner to close.

## Option

The plugin automatically reads the `pubspec.yaml` file with `build_runner` dependencies.

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

## screenshot

![screenshot.png](https://ftp.bmp.ovh/imgs/2021/04/070cb16d017ee66c.png)
