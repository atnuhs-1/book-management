// src/utils/fetchWrapper.ts
// ngrok警告を回避するためのfetchラッパー

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const fetchWithHeaders = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers: defaultHeaders,
  };

  console.log("🚀 Fetch Request:", {
    url,
    method: fetchOptions.method || "GET",
    headers: defaultHeaders,
  });

  try {
    const response = await fetch(url, fetchOptions);

    console.log("✅ Fetch Response:", {
      status: response.status,
      url: response.url,
      ok: response.ok,
    });

    return response;
  } catch (error) {
    console.error("❌ Fetch Error:", {
      url,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
};

// 認証が必要なAPIの場合
export const fetchWithAuth = async (
  url: string,
  token: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return fetchWithHeaders(url, {
    ...options,
    headers: authHeaders,
  });
};

// APIベースURLを取得する関数
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const cleanedBase = baseUrl.replace(/\/$/, ""); // 末尾の/を削除
  const cleanedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const fullUrl = `${cleanedBase}${cleanedEndpoint}`;

  console.log("🔗 API URL:", {
    baseUrl,
    endpoint,
    fullUrl,
    envVar: import.meta.env.VITE_API_URL,
  });

  return fullUrl;
};

export default fetchWithHeaders;
