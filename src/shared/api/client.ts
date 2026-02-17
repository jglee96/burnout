interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
}

function createUrl(path: string, query?: RequestOptions["query"]) {
  const isAbsolute = /^https?:\/\//.test(path);
  const url = isAbsolute
    ? new URL(path)
    : new URL(path, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return isAbsolute ? url.toString() : url.pathname + url.search;
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions,
  validate: (data: unknown) => data is T
): Promise<T> {
  const requestUrl = createUrl(path, options.query);
  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}). Check endpoint or retry action.`
    );
  }

  const data: unknown = await response.json();
  if (!validate(data)) {
    throw new Error("Invalid response shape. Verify API contract and payload.");
  }

  return data;
}
