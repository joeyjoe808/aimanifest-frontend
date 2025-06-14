// API configuration for AI Manifest Engine
const API_BASE_URL = 'http://localhost:5000';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Get auth token if it exists
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format - expected JSON');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: { name: string; email: string; password: string; company?: string }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials: { email: string; password: string }) {
    return this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/api/user/me');
  }

  // Project methods
  async createProject(projectData: any) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProjects() {
    return this.request('/api/projects');
  }

  async getProject(id: string) {
    return this.request(`/api/projects/${id}`);
  }

  // AI Manifest Engine methods
  async generateManifest(manifestData: any) {
    return this.request('/api/manifest-engine/generate', {
      method: 'POST',
      body: JSON.stringify(manifestData),
    });
  }

  // Billing methods
  async createSubscription(planId: string) {
    return this.request('/api/billing/create-subscription', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  }

  async getSubscription() {
    return this.request('/api/billing/subscription');
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiClient = new APIClient();