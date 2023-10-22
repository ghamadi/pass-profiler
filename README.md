## Overview

A lightweight and efficient library designed to analyze and assess the strength of passwords. The strength-measuring algorithm relies on entropy computation while being aware of predictable patterns and commonly used keywords within the password.

## How it Works

The algorithm measures a password's strength in three main steps:

### 1. Character Pool Size Computation

The library first determines the presence of different character types in the password.

### 2. Password sanitization

The password is sanitized by removing predictable patterns. This step allows the computed entropy to be more reliable by achieving two purposes:

1. Reintroducing a degree of randomness.
2. Nullifying the effect that the predictable patterns have on the password's length.

The `PasswordProfiler` first removes rejected patterns and then runs 4 sanitizing steps by default:

1. Strip down substring that are consequtively repeated (e.g., `aaabbb` => `ab`)
2. Strip down characters that are ascendingly sequential
3. Strip down characters that are descendingly sequential
4. Strip down pairs of interleaving letters & numbers (e.g., `A1b1` => `A1`)

The output from each step is piped into the next. The profiler generates all possible permutations of these steps to produce a final list of unique sanitized passwords.

### 3. Entropy Calculation & Strength Mapping

Entropy is calculated based on the formula `E = log_2(N^L)` where:

- `E` is entropy
- `N` is the original pool size
- `L` is the length of the _sanitized_ password

Entropy values are mapped to strength labels based on a predefined list. Users can override this list if needed.

## Motivation

To read more about the reasoning behing this approach to measure password strength, check out this [blog post](https://dev.to/ghamadi/rethinking-password-strength-estimation-beyond-composition-rules-408i).

## Installation

### NPM

```bash
npm install pass-profiler
```

### Yarn

```bash
yarn add pass-profiler
```

### PNPM

```bash
pnpm add pass-profiler
```

## Usage

### Basic Usage

```ts
import PasswordProfiler from 'pass-profiler';

const profiler = new PasswordProfiler();
const profile = profiler.parse('Aa1bb2cc3dd4ee5');

console.log(profile.sanitizedVersions); // [ 'Aace5', 'Aa1b2c3d4e5' ]
console.log(profile.entropy); // 47.63
console.log(profile.strength); // 'Weak'
```

> **Note**
>
> The password above is indeed predictable, evident by its lowercase version `'aa1bb2cc3dd4ee5'` appearing in leaked passwords databases.
>
> Despite this, most password verifiers, including [Kasperky's password checker](https://password.kaspersky.com) and the [UIC password checker](https://www.uic.edu/apps/strong-password/), would deem it very strong.

### Advanced Usage

The `PasswordProfiler` constructor offers configuration options to refine the sanitization step.

#### 1. `rejectedPatterns`

Certain words or patterns that are contextually relevant to a given application can reduce entropy. A common example for this would be the user's first name, family name, and username. The `PasswordProfiler` seeks and removes these patterns as part of the sanitization process.

Users can provide `rejectedPatterns` as a list of plain strings or regular expressions.

```ts
import PasswordProfiler from 'pass-profiler';

const profiler = new PasswordProfiler({
  rejectedPatterns: ['john'],
});

// "PA$$WORD" is one of the default rejected patterns
const profile = profiler.parse("john'sPa$$word");

console.log(profile.sanitzedVersions); // ["g'sP"]
console.log(profile.entropy); // 25.71
console.log(profile.strength); // 'Very Weak'
```

> **Note**
>
> Pattern matching is case _insensitive_, and regular expressions should be wrapped with `/` and should not include flags. (e.g., `/someword[0-9]+/`)

#### 2. `sanitizers`

Custom sanitizer callbacks can replace the default steps by passing an array to the `PasswordProfiler`. The order of sanitizers is irrelevant, as the profiler runs them in all potential sequences.

#### 4. `strict`

By default, the **average entropy** of all sanitized passwords is used as the effective entropy. When `strict` is set to `true`, the profiler uses the **minimum entropy** value instead.
