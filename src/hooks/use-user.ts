import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/auth/auth-context.tsx';
import { decodeToken } from 'react-jwt';
import { apiInstance } from '../utils/api-instance.ts';
import { z } from 'zod';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userRole: string;
}

// TODO: check user roles
const userRoles = ['STUDENT', 'LECTURER', 'ADMIN'] as const;

const tokenSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  id: z.number(),
  userRole: z.enum(userRoles),
  sub: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export type Token = z.infer<typeof tokenSchema>;

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
    const {
      data: validatedToken,
      success,
      error,
    } = tokenSchema.safeParse(decodedToken);

    if (success) {
      setUser({
        id: validatedToken.id,
        email: validatedToken.sub,
        firstName: validatedToken.firstName,
        lastName: validatedToken.lastName,
        userRole: validatedToken.userRole,
      });
    } else {
      console.error(
        'There was an error while trying to validate token: ',
        error
      );
    }
  };

  const removeUser = () => {
    setUser(null);
    setToken(null);

    delete apiInstance.defaults.headers.common['Authorization'];
  };

  return { user, addUser, removeUser, setUser, token, setToken };
};
