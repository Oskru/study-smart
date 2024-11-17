import { useUser } from './use-user.ts';
import { useNavigate } from 'react-router-dom';
import { LOGIN_URL, REGISTER_URL } from '../utils/consts/api.ts';
import { AxiosResponse } from 'axios';
import { AuthResponse } from '../types/api-response.ts';
import { apiInstance } from '../utils/api-instance.ts';

export const useAuth = () => {
  const { user, addUser, removeUser, token } = useUser();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const { data, status } = await apiInstance.post<
      any,
      AxiosResponse<AuthResponse>
    >(LOGIN_URL, {
      email,
      password,
    });

    if (status === 200) {
      addUser(data.token);
      navigate('/');
    }
  };

  const logout = () => {
    removeUser();
    navigate('/login');
  };

  const register = async (
    firstname: string,
    lastname: string,
    email: string,
    password: string
  ) => {
    const { data, status } = await apiInstance.post<
      any,
      AxiosResponse<AuthResponse>
    >(REGISTER_URL, {
      firstname,
      lastname,
      email,
      password,
    });

    if (status === 200) {
      addUser(data.token);
      navigate('/');
    }
  };

  return { user, token, login, logout, register };
};
