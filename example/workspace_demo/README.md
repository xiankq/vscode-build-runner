# Dart Workspace Demo for build_runner Extension

This example demonstrates a Dart workspace (monorepo) structure.

## Structure

```
workspace_demo/
├── pubspec.yaml          # Workspace root
├── packages/
│   ├── core/             # Core package
│   │   ├── pubspec.yaml
│   │   └── lib/src/user.dart
│   └── ui/               # UI package
│       ├── pubspec.yaml
│       └── lib/src/theme.dart
```

## Current Issue

The extension shows all pubspecs but runs build_runner without `--workspace` flag.

## Expected Command

```bash
cd workspace_demo
dart run build_runner build --workspace
```

> Note: `--delete-conflicting-outputs` is no longer needed in build_runner 2.13.0+.
