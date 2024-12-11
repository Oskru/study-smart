import { createContext, useEffect, useMemo, useState } from 'react';
import { User } from '../../hooks/use-user.ts';
import * as React from 'react';
import { apiInstance } from '../../utils/api-instance.ts';
import { useLocalStorage } from '../../hooks/use-local-storage.ts';

interface AuthContext {
  user: User | null;
  setUser: (user: User | null) => void;

  token: string | null;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},

  token: null,
  setToken: () => {},
});

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  const [token, setToken_] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const { setItem, removeItem } = useLocalStorage();

  const setToken = (token: string | null) => {
    if (token) {
      setItem('token', token);
    } else {
      removeItem('token');
    }

    setToken_(token);
  };

  useEffect(() => {
    setToken(token);

    if (token) {
      apiInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    } else {
      delete apiInstance.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const contextValue = useMemo(
    () => ({
      token,
      setToken,

      user,
      setUser,
    }),
    [token, user]
  );
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
