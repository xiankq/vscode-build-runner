# Dart build_runner

[English](https://github.com/xiankq/vscode-build-runner/blob/main/README.md) | 简体中文

[![GitHub](https://img.shields.io/github/stars/xiankq/vscode-build-runner?style=flat&logo=github)](https://github.com/xiankq/vscode-build-runner)
[![VS Code](https://badgen.citizen4.eu/vs-marketplace/i/Kaiqun.build-runner?label=VS%20Code&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=Kaiqun.build-runner)
[![Open VSX](https://img.shields.io/open-vsx/dt/Kaiqun/build-runner?style=flat&logo=openvsx&label=Open%20VSX&color=E98300)](https://open-vsx.org/extension/Kaiqun/build-runner)

快速运行 Flutter/Dart build_runner 的 VS Code 扩展。

![screenshot](https://github.com/xiankq/vscode-build-runner/raw/main/static/screenshot.png)

## 功能特性

- **原生体验**：与内置的 NPM Scripts 面板类似，直接集成在资源管理器侧边栏。
- **自动发现**：自动查找所有依赖了 `build_runner` 的包。
- **Dart Workspace 支持**：自动识别 workspace 根目录，使用 `--workspace` 标志统一执行代码生成任务。需要 build_runner >= 2.11.0。
- **任务集成**：使用 VS Code 的 Task API，提供原生终端控制（停止、重启）和清晰的输出。
- **Watch 与 Build**：可以为任意包独立或同时运行 `watch` 和 `build`。
- **智能显隐**：仅当存在 build_runner 项目时才显示树视图。
- **一键刷新**：随时重新扫描工作区，以识别新增或移除的包。

## 配置项

| 配置项                  | 类型    | 默认值                         | 说明                           |
| ----------------------- | ------- | ------------------------------ | ------------------------------ |
| `build_runner.fvm`      | boolean | `false`                        | 使用 FVM 运行 build_runner     |
| `build_runner.args`     | string  | `--delete-conflicting-outputs` | 传递给 build_runner 的额外参数 |
| `build_runner.excludes` | array   | `[]`                           | 扫描时排除的 glob 模式         |

## 使用方法

1. 在 VS Code 中打开 Flutter 或 Dart 项目。
2. 当检测到符合条件的包时，资源管理器侧边栏会显示 **BUILD RUNNER** 面板。
3. 将鼠标悬停在任意包上，点击 build 或 watch 图标。
4. 对于 Dart workspace，根包会标注为 `(workspace)`，并自动使用 `--workspace` 标志运行。

> 确保已正确配置 Flutter / Dart 的环境变量。参考 [build_runner 文档](https://github.com/dart-lang/build/tree/master/build_runner) 了解更多详情。如有需要，可为每个包配置 `build.yaml` 以排除不必要的文件，提升编译速度。

## 环境要求

- 已安装 Flutter / Dart SDK，并可在 PATH 中使用。
- VS Code 的 [Dart 扩展](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code)。
- 包必须在依赖或开发依赖中声明 `build_runner`。

```yaml
# pubspec.yaml
dev_dependencies:
  build_runner: any
```

### 启用 Workspace 支持

如需使用 Dart workspace 功能，在根目录 `pubspec.yaml` 中定义 workspace：

```yaml
# pubspec.yaml
name: my_workspace
workspace:
  - packages/core
  - packages/ui

dev_dependencies:
  build_runner: ^2.11.0
```

子包需要引用 workspace：

```yaml
# packages/core/pubspec.yaml
name: core
resolution: workspace

dev_dependencies:
  build_runner: any
```
