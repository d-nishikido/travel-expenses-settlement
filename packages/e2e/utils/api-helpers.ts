import { APIRequestContext } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export class ApiHelper {
  private request: APIRequestContext;
  private authToken?: string;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async authenticate(email: string, password: string) {
    const response = await this.request.post(`${API_URL}/api/auth/login`, {
      data: {
        email,
        password
      }
    });

    if (response.ok()) {
      const data = await response.json();
      this.authToken = data.token;
      return data;
    }
    throw new Error('Authentication failed');
  }

  async createTestUser(userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) {
    const response = await this.request.post(`${API_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      data: userData
    });

    return response.json();
  }

  async deleteTestUser(userId: string) {
    await this.request.delete(`${API_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
  }

  async cleanupTestData() {
    // Clean up test expense reports
    const reportsResponse = await this.request.get(`${API_URL}/api/expense-reports`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (reportsResponse.ok()) {
      const reports = await reportsResponse.json();
      for (const report of reports) {
        if (report.title.startsWith('Test Report -')) {
          await this.request.delete(`${API_URL}/api/expense-reports/${report.id}`, {
            headers: {
              'Authorization': `Bearer ${this.authToken}`
            }
          });
        }
      }
    }
  }
}