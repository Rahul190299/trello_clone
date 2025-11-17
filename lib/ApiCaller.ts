export interface ApiHeaders {
  [key: string]: string;
}

export class ApiCaller {
  private baseUrl: string;
  private defaultHeaders: ApiHeaders;

  constructor(baseUrl: string, defaultHeaders: ApiHeaders = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  async request<TResponse = any, TBody = any>(
    endpoint: string,
    method: string = "GET",
    body?: TBody,
    headers: ApiHeaders = {}
  ): Promise<TResponse> {
    const options: RequestInit = {
      method,
      headers: { ...this.defaultHeaders, ...headers },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const contentType = response.headers.get("content-type");

      let data: any;
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          (typeof data === "object" && data?.message) ||
          `API Error: ${response.status}`
        );
      }

      return data as TResponse;
    } catch (error) {
      console.error("API Request Failed:", error);
      throw error;
    }
  }

  get<TResponse>(endpoint: string, headers?: ApiHeaders) {
    return this.request<TResponse>(endpoint, "GET", undefined, headers);
  }

  post<TResponse, TBody>(endpoint: string, body: TBody, headers?: ApiHeaders) {
    return this.request<TResponse, TBody>(endpoint, "POST", body, headers);
  }

  put<TResponse, TBody>(endpoint: string, body: TBody, headers?: ApiHeaders) {
    return this.request<TResponse, TBody>(endpoint, "PUT", body, headers);
  }

  delete<TResponse>(endpoint: string, headers?: ApiHeaders) {
    return this.request<TResponse>(endpoint, "DELETE", undefined, headers);
  }

  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }
}
