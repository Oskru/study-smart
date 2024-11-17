export function authorizedFetch(
  url: string,

  options?: RequestInit
) {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  });
}
