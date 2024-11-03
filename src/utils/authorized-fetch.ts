export function authorizedFetch(
  url: string,
  email: string,
  password: string,
  options?: RequestInit
) {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: getAuthorizationHeader(email, password),
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function getAuthorizationHeader(email: string, password: string) {
  return `Basic ${btoa(`${email}:${password}`)}`;
}
