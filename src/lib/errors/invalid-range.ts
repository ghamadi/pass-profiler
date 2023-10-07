export default class InvalidRangeError extends Error {
  constructor(range: [number, number], reason?: string) {
    super(`Invalid Range: ${range}. ${reason}`.trim());
  }
}
