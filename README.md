# 快速运行 Flutter/Dart build_runner的VSCode插件

## Inspiration
灵感来源于VSCode自带的NPM脚本工具



## Features
* 与`VSCode NPM脚本`几乎一致的优质体验
* 支持多个工作区下的多个独立Package的build_runner运行
* 自动识别工作区中带有build_runner依赖的Package
* 多个Package运行时日志打印完全独立
* 同时支持build_runner watch/build
* 插件默认`--delete-conflicting-outputs`配置启动build_runner

## Usage
* 你务必要正确配置Flutter/dart的环境变量
* 阅读[build_runner](https://github.com/dart-lang/build/tree/master/build_runner)相关文档。有必要时，你需要对每一个即将运行的package配置`build.yaml`来忽略一些不必要的文件以至于提升编译速度
* 关闭对应的终端会触发build_runner关闭



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
![screenshot.png](https://i.loli.net/2021/04/13/azTckg8venIJExi.png)

