// Central helper for REST/Convex calls; extend with auth and retries later.
export const apiClient = async <T>(endpoint: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(endpoint, init);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
};
