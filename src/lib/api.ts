const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type FetchOptions = RequestInit & {
  timeoutMs?: number;
};

const withTimeout = (signal: AbortSignal | undefined, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  return { controller, timeout };
};

export const apiFetchJson = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
  const { timeoutMs = 8000, ...rest } = options;
  const { controller, timeout } = withTimeout(rest.signal, timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...rest.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

export { API_BASE_URL };
