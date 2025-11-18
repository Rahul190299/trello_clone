
export interface ApiHeaders {
  [key: string]: string;
}

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/me",
  },
  BOARD: {
    GET: "/board?type=boards",
    GET_ONE: (id: string | number) => `/board?type=board&boardid=${id}`,
    UPDATE : '/board'
  },
  COLUMN: {
    LIST: (id : string | number ) => `/column?boardid=${id}`,
    CREATE : "/column",
    PATCH : "/column"
  },
  TASK : {
    LIST: (id : string | number ) => `/task?boardid=${id}`,
    CREATE : "/task",
    PATCH : "/task"
  }
} as const;

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE"
}

export class ApiCaller {
  constructor(
    private baseUrl: string,
    private defaultHeaders: ApiHeaders = {
      "Content-Type": "application/json"
    }
  ) {}

  private async request<TResponse, TBody = unknown>(
    endpoint: string,
    method: HttpMethod,
    body?: TBody,
    headers: ApiHeaders = {}
  ): Promise<TResponse> {
    
    const options: RequestInit = {
      method,
      headers: { ...this.defaultHeaders, ...headers }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(response.status, data?.message ?? "API Error");
    }

    return data as TResponse;
  }

  get<TResponse>(endpoint: string, headers?: ApiHeaders) {
    return this.request<TResponse>(endpoint, HttpMethod.GET, undefined, headers);
  }

  post<TResponse, TBody>(endpoint: string, body: TBody, headers?: ApiHeaders) {
    return this.request<TResponse, TBody>(endpoint, HttpMethod.POST, body, headers);
  }

  put<TResponse, TBody>(endpoint: string, body: TBody, headers?: ApiHeaders) {
    return this.request<TResponse, TBody>(endpoint, HttpMethod.PUT, body, headers);
  }

  delete<TResponse>(endpoint: string, headers?: ApiHeaders) {
    return this.request<TResponse>(endpoint, HttpMethod.DELETE, undefined, headers);
  }

  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
