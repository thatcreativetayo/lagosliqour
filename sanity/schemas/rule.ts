export interface ValidationRule {
  required(): ValidationRule;
  min(value: number): ValidationRule;
  max(value: number): ValidationRule;
  integer(): ValidationRule;
  regex(pattern: RegExp, options?: { name?: string }): ValidationRule;
}
