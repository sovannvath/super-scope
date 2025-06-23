import { apiClient, makeApiCall, ApiResponse } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  role_id?: number;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> =>
    makeApiCall(() => apiClient.post("/login", credentials)),

  register: async (
    userData: RegisterData,
  ): Promise<ApiResponse<AuthResponse>> =>
    makeApiCall(() => apiClient.post("/register", userData)),

  logout: async (): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.post("/logout")),

  getCurrentUser: async (): Promise<ApiResponse<User>> =>
    makeApiCall(() => apiClient.get("/user")),

  refreshToken: async (): Promise<ApiResponse<AuthResponse>> =>
    makeApiCall(() => apiClient.post("/refresh")),

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> =>
    makeApiCall(() => apiClient.put("/profile", userData)),

  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<void>> =>
    makeApiCall(() => apiClient.put("/password", data)),
};
