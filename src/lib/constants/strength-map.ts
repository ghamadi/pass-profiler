export type StrengthRange = {
  label: string;
  range: [number, number];
};

export type PasswordStrengthRanges = StrengthRange[];

export const DEFAULT_STRENGTH_RANGES: PasswordStrengthRanges = [
  {
    label: 'Very Weak',
    range: [0, 28.0],
  },
  {
    label: 'Weak',
    range: [28.01, 50.0],
  },
  {
    label: 'Reasonable',
    range: [50.01, 60.0],
  },
  {
    label: 'Strong',
    range: [60.01, 80],
  },
  {
    label: 'Very Strong',
    range: [80.01, Infinity],
  },
];
