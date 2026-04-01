# 快速运行 Flutter/Dart build_runner 的 VSCode 插件

[English](https://github.com/xiankaiqun/vscode-build-runner/blob/master/README.md) | 简体中文

## 灵感来源

灵感来源于 VSCode 自带的 NPM 脚本工具

## 功能特性

- 与 `VSCode NPM 脚本` 几乎一致的优质体验
- 支持多个工作区下多个独立 Package 的 build_runner 运行（monorepo）
- 自动识别工作区中带有 build_runner 依赖的 Package
- 使用 VSCode Task API，提供原生终端体验与控制按钮（停止、重启）
- 同时支持 build_runner watch/build
- 当未检测到 build_runner 项目时自动隐藏树图
- 刷新按钮可重新扫描工作区中的 build_runner 项目

## 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `build_runner.fvm` | boolean | `false` | 使用 FVM 运行 build_runner |
| `build_runner.args` | string | `--delete-conflicting-outputs` | 传递给 build_runner 的额外参数 |
| `build_runner.excludes` | array | `[]` | 扫描时排除的 glob 模式 |

## 使用方法

- 务必正确配置 Flutter/Dart 的环境变量
- 阅读 [build_runner](https://github.com/dart-lang/build/tree/master/build_runner) 相关文档。有需要时，你需要对每一个即将运行的 package 配置 `build.yaml` 来忽略一些不必要的文件，以提升编译速度
- 关闭对应的终端会触发 build_runner 关闭

## 依赖识别

插件自动读取带有 `build_runner` 依赖的 `pubspec.yaml` 文件

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
