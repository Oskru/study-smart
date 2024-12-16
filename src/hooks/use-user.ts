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

const userRoles = ['STUDENT', 'LECTURER', 'PLANNER', 'ADMIN'] as const;
const userRolesSchema = z.enum(userRoles);
export type UserRole = z.infer<typeof userRolesSchema>;

const tokenSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  id: z.number(),
  userRole: userRolesSchema,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const addUser = (token: string) => {
    setToken(token);
    apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const decodedToken = decodeToken<Token>(token);
    const parsed = tokenSchema.safeParse(decodedToken);

    if (parsed.success) {
      setUser({
        id: parsed.data.id,
        email: parsed.data.sub,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        userRole: parsed.data.userRole,
      });
    } else {
      console.error(
        'There was an error while trying to validate token: ',
        parsed.error
      );
    }
  };

  const removeUser = () => {
    setUser(null);
    setToken(null); // This should trigger localStorage removal in AuthContext
    delete apiInstance.defaults.headers.common['Authorization'];
  };

  return { user, addUser, removeUser, setUser, token, setToken };
};
