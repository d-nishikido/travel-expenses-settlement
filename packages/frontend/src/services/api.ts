import axios, { AxiosInstance, AxiosError } from 'axios';
import { LoginRequest, LoginResponse, ApiError } from '@/types';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const status = error.response?.status || 500;
    return { message, status };
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Expense Reports endpoints
  async getExpenseReports(params?: { status?: string; page?: number; limit?: number }) {
    const response = await this.client.get('/expense-reports', { params });
    return response.data;
  }

  async getExpenseReport(id: string) {
    const response = await this.client.get(`/expense-reports/${id}`);
    return response.data;
  }

  async createExpenseReport(data: any) {
    const response = await this.client.post('/expense-reports', data);
    return response.data;
  }

  async updateExpenseReport(id: string, data: any) {
    const response = await this.client.put(`/expense-reports/${id}`, data);
    return response.data;
  }

  async deleteExpenseReport(id: string) {
    const response = await this.client.delete(`/expense-reports/${id}`);
    return response.data;
  }

  async submitExpenseReport(id: string) {
    const response = await this.client.post(`/expense-reports/${id}/submit`);
    return response.data;
  }

  async approveExpenseReport(id: string, comment?: string) {
    const response = await this.client.post(`/expense-reports/${id}/approve`, { comment });
    return response.data;
  }

  async rejectExpenseReport(id: string, comment?: string) {
    const response = await this.client.post(`/expense-reports/${id}/reject`, { comment });
    return response.data;
  }

  // Expense Items endpoints
  async getExpenseItems(reportId: string) {
    const response = await this.client.get(`/expense-reports/${reportId}/items`);
    return response.data;
  }

  async createExpenseItem(reportId: string, data: any) {
    const response = await this.client.post(`/expense-reports/${reportId}/items`, data);
    return response.data;
  }

  async updateExpenseItem(reportId: string, itemId: string, data: any) {
    const response = await this.client.put(`/expense-reports/${reportId}/items/${itemId}`, data);
    return response.data;
  }

  async deleteExpenseItem(reportId: string, itemId: string) {
    const response = await this.client.delete(`/expense-reports/${reportId}/items/${itemId}`);
    return response.data;
  }

  // Users endpoints (accounting only)
  async getUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.client.post('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/users/${id}`);
    return response.data;
  }

  // Reports endpoints (accounting only)
  async getSummaryReport() {
    const response = await this.client.get('/reports/summary');
    return response.data;
  }

  async exportReport(format: 'csv' | 'pdf') {
    const response = await this.client.get(`/reports/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();