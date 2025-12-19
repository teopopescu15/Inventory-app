import axios from 'axios';
import type { Category } from '../types/category';
import type { Product } from '../types/product';
import type {
  ProductCountHistory,
  InventoryAnalysis,
  QuickStats,
} from '../types/analysis';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',  // Uses env var or Vite proxy in development
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// User interface
export interface User {
  id?: number;
  companyName: string;
  companyEmail: string;
  password?: string;
  token?: string;  // JWT token returned from login
}

// API methods
export const apiService = {
  // GET request
  sayHello: async () => {
    const response = await api.get('/hello');
    return response.data;
  },

  // GET with path variable
  sayHelloToName: async (name: string) => {
    const response = await api.get(`/hello/${name}`);
    return response.data;
  },

  // POST request
  echo: async (data: Record<string, unknown>) => {
    const response = await api.post('/echo', data);
    return response.data;
  },

  // User API methods
  users: {
    // Get all users
    getAll: async (): Promise<User[]> => {
      const response = await api.get('/users');
      return response.data;
    },

    // Get user by ID
    getById: async (id: number): Promise<User> => {
      const response = await api.get(`/users/${id}`);
      return response.data;
    },

    // Create new user (signup)
    create: async (user: User): Promise<User> => {
      const response = await api.post('/users', user);
      return response.data;
    },

    // Update user
    update: async (id: number, user: Partial<User>): Promise<User> => {
      const response = await api.put(`/users/${id}`, user);
      return response.data;
    },

    // Delete user
    delete: async (id: number): Promise<void> => {
      await api.delete(`/users/${id}`);
    },
  },

  // Category API methods
  categories: {
    // Get all categories for a company (companyId extracted from JWT token on backend)
    getAll: async (): Promise<Category[]> => {
      const response = await api.get('/categories');
      return response.data;
    },

    // Get category by ID (companyId extracted from JWT token on backend)
    getById: async (id: number): Promise<Category> => {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    },

    // Create new category (companyId extracted from JWT token on backend)
    create: async (category: Category): Promise<Category> => {
      const response = await api.post('/categories', category);
      return response.data;
    },

    // Update category (companyId extracted from JWT token on backend)
    update: async (id: number, category: Partial<Category>): Promise<Category> => {
      const response = await api.put(`/categories/${id}`, category);
      return response.data;
    },

    // Delete category (companyId extracted from JWT token on backend)
    delete: async (id: number): Promise<void> => {
      await api.delete(`/categories/${id}`);
    },
  },

  // Product API methods
  products: {
    // Get all products for a company (companyId extracted from JWT token on backend)
    getAll: async (): Promise<Product[]> => {
      const response = await api.get('/products');
      return response.data;
    },

    // Get products by category (companyId extracted from JWT token on backend)
    getByCategory: async (categoryId: number): Promise<Product[]> => {
      const response = await api.get(`/products/category/${categoryId}`);
      return response.data;
    },

    // Get product by ID (companyId extracted from JWT token on backend)
    getById: async (id: number): Promise<Product> => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },

    // Create new product (companyId extracted from JWT token on backend)
    create: async (product: Product): Promise<Product> => {
      const response = await api.post('/products', product);
      return response.data;
    },

    // Update product (companyId extracted from JWT token on backend)
    update: async (id: number, product: Partial<Product>): Promise<Product> => {
      const response = await api.put(`/products/${id}`, product);
      return response.data;
    },

    // Delete product (companyId extracted from JWT token on backend)
    delete: async (id: number): Promise<void> => {
      await api.delete(`/products/${id}`);
    },
  },

  // Authentication methods
  auth: {
    // Login
    login: async (email: string, password: string): Promise<User> => {
      const response = await api.post('/users/login', {
        email,
        password,
      });
      return response.data;
    },

    // Signup (create user)
    signup: async (user: User): Promise<User> => {
      const response = await api.post('/users', user);
      return response.data;
    },
  },

  // Product count history methods
  productHistory: {
    // Get history for a specific product
    getByProduct: async (productId: number): Promise<ProductCountHistory[]> => {
      const response = await api.get(`/products/${productId}/history`);
      return response.data;
    },

    // Get all history for the company (last 6 months)
    getAll: async (): Promise<ProductCountHistory[]> => {
      const response = await api.get('/products/history');
      return response.data;
    },
  },

  // Analysis methods
  analysis: {
    // Get full AI-powered analysis
    getAnalysis: async (): Promise<InventoryAnalysis> => {
      const response = await api.get('/analysis');
      return response.data;
    },

    // Get quick stats without AI (faster)
    getQuickStats: async (): Promise<QuickStats> => {
      const response = await api.get('/analysis/quick-stats');
      return response.data;
    },
  },
};

export default api;
