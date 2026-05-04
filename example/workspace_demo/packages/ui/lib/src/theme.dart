import 'package:json_annotation/json_annotation.dart';

part 'theme.g.dart';

@JsonSerializable()
class AppTheme {
  final String primaryColor;
  final String secondaryColor;
  final bool isDarkMode;

  AppTheme({
    required this.primaryColor,
    required this.secondaryColor,
    required this.isDarkMode,
  });

  factory AppTheme.fromJson(Map<String, Object?> json) =>
      _$AppThemeFromJson(json);

  Map<String, Object?> toJson() => _$AppThemeToJson(this);
}
