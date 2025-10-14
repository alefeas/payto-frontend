import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Traducir mensajes de error comunes al español
    if (error.response?.data?.message) {
      const message = error.response.data.message;
      const translations: Record<string, string> = {
        'This action is unauthorized.': 'No tienes permisos para realizar esta acción',
        'Unauthenticated.': 'No autenticado',
        'The given data was invalid.': 'Los datos proporcionados son inválidos',
        'Server Error': 'Error del servidor',
        'Not Found': 'No encontrado',
      };
      
      if (translations[message]) {
        error.response.data.message = translations[message];
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
