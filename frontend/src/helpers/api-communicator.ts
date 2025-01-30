import axios from "axios";

// API endpoints configuration
const API_ENDPOINTS = {
  LOGIN: "/user/login",
  AUTH_STATUS: "/user/auth-status", 
  CHAT_NEW: "/chat/new",
  CHAT_ALL: "/chat/all-chats",
  CHAT_DELETE: "/chat/delete",
  LOGOUT: "/user/logout",
  SIGNUP: "/user/signup"
} as const;

// Generic API request handler to reduce code duplication
const makeRequest = async <T>(
  method: 'get' | 'post' | 'delete',
  url: string,
  data?: object,
  errorMessage?: string
): Promise<T> => {
  try {
    const config = {
      method,
      url,
      data,
    };
    
    const response = await axios(config);
    const expectedStatus = method === 'post' && url === API_ENDPOINTS.SIGNUP ? 201 : 200;
    
    if (response.status !== expectedStatus) {
      throw new Error(errorMessage || `Request failed with status ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(errorMessage || 'Request failed');
  }
};

// User authentication related functions
export const loginUser = async (email: string, password: string) => 
  makeRequest('post', API_ENDPOINTS.LOGIN, { email, password }, 'Unable to login');

export const checkAuthStatus = async () => 
  makeRequest('get', API_ENDPOINTS.AUTH_STATUS, undefined, 'Unable to authenticate');

export const logoutUser = async () => 
  makeRequest('get', API_ENDPOINTS.LOGOUT, undefined, 'Unable to logout user');

export const signupUser = async (name: string, email: string, password: string) => 
  makeRequest('post', API_ENDPOINTS.SIGNUP, { name, email, password }, 'Unable to signup');

// Chat related functions
export const sendChatRequest = async (message: string) => 
  makeRequest('post', API_ENDPOINTS.CHAT_NEW, { message }, 'Unable to send chat');

export const getUserChats = async () => 
  makeRequest('get', API_ENDPOINTS.CHAT_ALL, undefined, 'Unable to fetch chats');

export const deleteUserChats = async () => 
  makeRequest('delete', API_ENDPOINTS.CHAT_DELETE, undefined, 'Unable to delete chat');
