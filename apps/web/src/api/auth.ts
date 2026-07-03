import type {
  AuthTokensDto,
  LoginInput,
  RegisterInput,
  UserDto,
} from '@zenith/shared';
import { apiClient } from './client';

export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<AuthTokensDto>('/auth/register', input, false),
  login: (input: LoginInput) =>
    apiClient.post<AuthTokensDto>('/auth/login', input, false),
  logout: (refreshToken: string) =>
    apiClient.post<void>('/auth/logout', { refreshToken }, false),
  me: () => apiClient.get<UserDto>('/users/me'),
};
