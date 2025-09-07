/**
 * Await a promise and return a tuple of [data, error].
 * Keeps async code cleaner than using try/catch everywhere.
 *
 * @template T
 * @param {Promise<T>} promise - The promise to resolve.
 * @returns {Promise<[T|null, Error|null]>}
 */
export async function handleError(promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err instanceof Error ? err : new Error(String(err))];
  }
}
