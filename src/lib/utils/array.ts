export function permute<T>(arr: T[]) {
  function generate<T>(input: T[], output: T[], permutations: T[][]) {
    if (input.length === 0) {
      permutations.push(output.slice());
    }
    let prev: T | null = null;
    for (let i = 0; i < input.length; i++) {
      if (prev === input[i]) continue;

      let newInput = input.slice(0, i).concat(input.slice(i + 1));

      output.push(input[i]);
      generate(newInput, output, permutations);
      output.pop();
      prev = input[i];
    }

    return permutations;
  }

  return generate(arr.sort(), [], []);
}
