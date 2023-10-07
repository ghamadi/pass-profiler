import PasswordProfile from '~/lib/password-profile';
import { PasswordStrengthRanges } from '~/lib/constants/strength-map';
import { DEFAULT_STRENGTH_RANGES } from '~/lib/constants/strength-map';
import COMMON_PATTERNS from '~/lib/constants/common-patterns';
import {
  stripInterleavingPairs,
  stripPattern,
  stripReatedStrings,
  stripSequentialStrings,
} from '~/lib/utils/string';
import { permute } from '~/lib/utils/array';
import InvalidRangeError from '~/lib/errors/invalid-range';
import { assert } from '~/lib/utils/errorts';

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
  private sanitizersList: SanitizersList;
  private rejectedPatterns: string[];

  constructor(options: ProfilerOptions = {}) {
    this.strengthRanges = this.setupStrengthRanges(options);
    this.rejectedPatterns = this.setupRejectedPatterns(options);
    this.sanitizersList = this.setupSanitizersList(options);
  }

  parse(password: string) {
    return new PasswordProfile(password, {
      rejectedPatterns: this.rejectedPatterns,
      sanitizersList: this.sanitizersList,
      strengthRanges: this.strengthRanges,
    });
  }

  /**
   * Returns a 2D array of sanitizers list.
   *
   * If `exhaustive` is `true`, the 2D array will be a list of all the permutations of the sanitizers.
   * Otherwise, it will only contain the provided santizers in the given order.
   *
   * If custom sanitizers are not provided, the default sanitizers are used.
   */
  private setupSanitizersList(options: ProfilerOptions) {
    assert(
      this.rejectedPatterns,
      'Initialize `rejectedPatterns` before calling `setupSanitizersList`.'
    );

    const sanitizers = options.sanitizers ?? [
      (str) => stripReatedStrings(str),
      (str) => this.rejectedPatterns.reduce((out, pattern) => stripPattern(out, pattern), str),
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

    if (!strengthRanges) {
      return DEFAULT_STRENGTH_RANGES;
    }

    let previousMax: number;

    // validate the custom ranges
    for (const { range } of strengthRanges) {
      const [min, max] = range;
      previousMax ??= min;

      if (max < min) {
        throw new InvalidRangeError([min, max]);
      }
      if (min <= previousMax) {
        throw new InvalidRangeError([min, max], `The range should start at ${previousMax + 0.01}`);
      }
      previousMax = max;
    }

    return strengthRanges;
  }

  private setupRejectedPatterns(options: ProfilerOptions) {
    // remove duplicates and sort from longest to shortest to handle cases like ['1234', '123']
    return [...new Set([...COMMON_PATTERNS, ...(options.rejectedPatterns ?? [])])].sort(
      (p1, p2) => p2.length - p1.length
    );
  }
}
