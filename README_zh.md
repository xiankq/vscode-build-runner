# 快速运行 Flutter/Dart build_runner 的 VS Code 扩展

[English](https://github.com/xiankaiqun/vscode-build-runner/blob/main/README.md) | 简体中文

## 灵感来源

灵感来源于 VS Code 内置的 NPM Scripts 工具。

## 功能特性

- 与内置的 `NPM Scripts` 视图几乎一致的体验
- 支持跨多个工作区运行多个独立包的 build_runner（monorepo）
- 自动检测工作区中带有 build_runner 依赖的包
- 使用 VS Code Task API 提供原生终端体验与控制按钮（停止、重启）
- 同时支持 build_runner watch 和 build
- 未检测到 build_runner 项目时自动隐藏视图
- 刷新按钮可重新扫描工作区中的 build_runner 项目

## 配置项

| 配置项                  | 类型    | 默认值                         | 说明                           |
| ----------------------- | ------- | ------------------------------ | ------------------------------ |
| `build_runner.fvm`      | boolean | `false`                        | 使用 FVM 运行 build_runner     |
| `build_runner.args`     | string  | `--delete-conflicting-outputs` | 传递给 build_runner 的额外参数 |
| `build_runner.excludes` | array   | `[]`                           | 扫描时排除的 glob 模式         |

## 使用方法

- 确保已正确配置 Flutter/Dart 的环境变量
- 参考 [build_runner](https://github.com/dart-lang/build/tree/master/build_runner) 文档。如有需要，为每个包配置 `build.yaml` 以排除不必要的文件，提升编译速度
- 关闭对应的终端会停止 build_runner 进程

## 依赖识别

扩展会自动检测包含 build_runner 依赖的 `pubspec.yaml` 文件

```yaml
# pubspec.yaml
# ...
dev_dependencies:
  build_runner: any
  # 或
dependencies:
  build_runner: any
  # ...
```

## 截图

![screenshot.png](https://ftp.bmp.ovh/imgs/2021/04/070cb16d017ee66c.png)
