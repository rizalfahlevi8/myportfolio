import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Format response dari backend kamu
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

/**
 * Global axios fetcher
 */
export async function axiosFetcher<T = unknown>(
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await sendRequest<ApiResponse<T>>(
      method,
      url,
      data,
      config
    );

    return response.data;
  } catch (error) {
    return handleAxiosError<T>(error);
  }
}

/**
 * Handle HTTP method
 */
async function sendRequest<T>(
  method: "get" | "post" | "put" | "delete" | "patch",
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  switch (method) {
    case "get":
      return axios.get<T>(url, config);

    case "post":
      return axios.post<T>(url, data, config);

    case "put":
      return axios.put<T>(url, data, config);

    case "patch":
      return axios.patch<T>(url, data, config);

    case "delete":
      return axios.delete<T>(url, config);

    default:
      throw new Error("Unsupported HTTP method");
  }
}

/**
 * Handle error dari axios
 */
function handleAxiosError<T>(error: unknown): ApiResponse<T> {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.request) {
      return {
        success: false,
        message: "Tidak ada response dari server",
      };
    }

    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: false,
    message: "Unknown error",
  };
}
