# Quickly run the VSCode plugin of Flutter/Dart build_runner

 English | [简体中文](https://github.com/awagege/vscode-build-runner/blob/master/README_zh.md)

## Inspiration
Inspired by the NPM script tool that comes with VSCode.



## Features
* High-quality experience almost the same as `VSCode NPM script`.
* Support build_runner operation of multiple independent packages under multiple workspaces.
* Automatically identify Packages with build_runner dependencies in the workspace.
* Log printing is completely independent when running multiple packages.
* Support build_runner watch/build at the same time.
* The plugin default `--delete-conflicting-outputs` configuration starts build_runner.


## Usage
* You must configure the Flutter/dart environment variables correctly.
* Read [build_runner](https://github.com/dart-lang/build/tree/master/build_runner) related documents. When necessary, you need to configure `build.yaml` for each package to be run to ignore some unnecessary files to improve compilation speed.
* Closing the corresponding terminal will trigger build_runner to close.



## Option
The plugin automatically reads the `pubspec.yaml` file with `build_runner` dependencies.
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

