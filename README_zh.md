# 快速运行 Flutter/Dart build_runner 的 VSCode 插件

[English](https://github.com/xiankaiqun/vscode-build-runner/blob/master/README.md)| 简体中文

## Inspiration

灵感来源于 VSCode 自带的 NPM 脚本工具

## Features

- 与`VSCode NPM脚本`几乎一致的优质体验
- 支持多个工作区下的多个独立 Package 的 build_runner 运行
- 自动识别工作区中带有 build_runner 依赖的 Package
- 多个 Package 运行时日志打印完全独立
- 同时支持 build_runner watch/build
- 插件默认`--delete-conflicting-outputs`配置启动 build_runner

## Usage

- 你务必要正确配置 Flutter/dart 的环境变量
- 阅读[build_runner](https://github.com/dart-lang/build/tree/master/build_runner)相关文档。有必要时，你需要对每一个即将运行的 package 配置`build.yaml`来忽略一些不必要的文件以至于提升编译速度
- 关闭对应的终端会触发 build_runner 关闭

## Option

插件自动读取带有`build_runner`依赖的`pubspec.yaml`文件

```yaml
  #pubspec.yaml
  #...
  dev_dependencies
   build_runner: any
  #or
  dependencies
   build_runner: any
  #...
```

## screenshot

![screenshot.png](https://ftp.bmp.ovh/imgs/2021/04/070cb16d017ee66c.png)
