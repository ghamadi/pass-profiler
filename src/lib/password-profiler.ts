import { PasswordStrengthRanges } from '~/index';
import { DEFAULT_STRENGTH_RANGES } from '~/lib/constants/strength-map';
import COMMON_PATTERNS from '~/lib/constants/common-patterns';
import {
  stripInterleavingPairs,
  stripPattern,
  stripReatedStrings,
  stripSequentialStrings,
} from '~/lib/utils/string';
import { permute } from '~/lib/utils/array';

export type Sanitizers = ((str: string) => string)[];

export type SanitizersList = Sanitizers[];

export type ProfilerOptions = {
  // When true, the parser runs all permutations of the sanitization steps and outputs average entropy
  exhaustive?: boolean;

  // The ranges used to map the password's strength based on its entropy
  strengthRanges?: PasswordStrengthRanges;

  // Additional, custom patterns to be sanitized
  rejectedPatterns?: string[];

  // A list of custom sanitizers that replaces the default list
  sanitizers?: Sanitizers;
};

export default class PasswordProfiler {
  private strengthRanges: PasswordStrengthRanges;
  private sanitizers: SanitizersList;
  private rejectedPatterns: string[];

  constructor(options: ProfilerOptions) {
    this.strengthRanges = this.setupStrengthRanges(options);
    this.rejectedPatterns = this.setupRejectedPatterns(options);
    this.sanitizers = this.setupSanitizersList(options);
  }

  parse(password: string) {}

  private setupSanitizersList(options: ProfilerOptions) {
    // TODO: Add an `assert` function to make sure this.rejectedPatterns is setup
    const patterns = this.rejectedPatterns ?? this.setupRejectedPatterns(options);

    const sanitizers = options.sanitizers ?? [
      (str) => stripReatedStrings(str),
      (str) => patterns.reduce((out, pattern) => stripPattern(out, pattern), str),
      (str) => stripSequentialStrings(str, 1),
      (str) => stripSequentialStrings(str, -1),
      (str) => stripInterleavingPairs(str),
    ];

    if (options.exhaustive) {
      return permute(sanitizers);
    }
    return [sanitizers];
  }

  private setupStrengthRanges(options: ProfilerOptions) {
    const { strengthRanges } = options;
    // validate the custom ranges
    if (strengthRanges) {
      let previousMax: number;
      for (const { range } of strengthRanges) {
        const [min, max] = range;
        previousMax ??= min;
        if (min < previousMax) {
          throw new Error(`Invalid Range: The range ${[min, max]} should be after ${previousMax}`);
        }
        if (max < min) {
          throw new Error(
            `Invalid Range: ${[min, max]}. The left edge should be smaller than the right edge.`
          );
        }
        previousMax = max;
      }
      return strengthRanges;
    }
    return DEFAULT_STRENGTH_RANGES;
  }

  private setupRejectedPatterns(options: ProfilerOptions) {
    // remove duplicates and sort from longest to shortest to handle cases like ['1234', '123']
    return [...new Set([...COMMON_PATTERNS, ...(options.rejectedPatterns ?? [])])].sort(
      (p1, p2) => p2.length - p1.length
    );
  }
}
