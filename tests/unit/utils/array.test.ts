import { permute } from '~/lib/utils/array';

describe('permute function', () => {
  test('permutes an empty array', () => {
    expect(permute([])).toEqual([[]]);
  });

  test('permutes an array with one element', () => {
    expect(permute([1])).toEqual([[1]]);
  });

  test('permutes an array with two elements', () => {
    expect(permute([1, 2])).toEqual([
      [1, 2],
      [2, 1],
    ]);
  });

  test('Permutes an array with three elements', () => {
    expect(permute([1, 2, 3])).toEqual([
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ]);
  });

  test('Permutes an array with non-numeric elements', () => {
    expect(permute(['a', 'b', 'c'])).toEqual([
      ['a', 'b', 'c'],
      ['a', 'c', 'b'],
      ['b', 'a', 'c'],
      ['b', 'c', 'a'],
      ['c', 'a', 'b'],
      ['c', 'b', 'a'],
    ]);
  });

  test('Permutes an array with different types', () => {
    expect(permute([1, 'b', true])).toEqual([
      [1, 'b', true],
      [1, true, 'b'],
      ['b', 1, true],
      ['b', true, 1],
      [true, 1, 'b'],
      [true, 'b', 1],
    ]);
  });

  test('Permutes a larger array', () => {
    expect(permute([1, 2, 3, 4, 5]).length).toBe(120); // 5!
    expect(permute([1, 2, 3, 4, 5, 6]).length).toBe(720); // 6!
  });

  test('Produces unique permutations', () => {
    expect(permute([1, 1, 2])).toEqual([
      [1, 1, 2],
      [1, 2, 1],
      [2, 1, 1],
    ]);
  });
});
