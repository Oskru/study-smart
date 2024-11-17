import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth/auth-context.tsx';
import { decodeToken } from 'react-jwt';
import { apiInstance } from '../utils/api-instance.ts';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userRole: string;
}

export interface Token {
  firstName: string;
  lastName: string;
  id: number;
  userRole: string;
  sub: string;
  iat: number;
  exp: number;
}

export const useUser = () => {
  const { user, setUser, token, setToken } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      addUser(token);
    } else {
      removeUser();
    }
  }, [token]);

  const addUser = (token: string) => {
    setToken(token);
    apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const decodedToken = decodeToken<Token>(token);

    if (decodedToken) {
      console.log(decodedToken.userRole);
      setUser({
        id: decodedToken.id,
        email: decodedToken.sub,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        userRole: decodedToken.userRole,
      });
    } else {
      console.error('There was an error trying to validate token');
    }
  };

  const removeUser = () => {
    setUser(null);
    setToken(null);
    delete apiInstance.defaults.headers.common['Authorization'];
  };

  return { user, addUser, removeUser, setUser, token, setToken };
};
