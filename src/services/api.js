import axios from 'axios';

const TOKEN_KEY = 'oficina_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let logoutHandler = null;

export function setLogoutHandler(handler) {
  logoutHandler = handler;
}

export function getTokenKey() {
  return TOKEN_KEY;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && logoutHandler) {
      logoutHandler();
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  if (!error.response) {
    return 'Servidor offline ou sem conexão. Verifique se a API está rodando.';
  }

  const { data, status } = error.response;

  if (data?.errors?.length) {
    return data.errors.map((e) => e.msg || e.message).join('. ');
  }

  if (data?.message) {
    return data.message;
  }

  if (status === 403) return 'Acesso negado. Você não tem permissão para esta ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status === 409) return 'Registro duplicado ou conflito de dados.';

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export default api;
