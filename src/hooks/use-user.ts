import { useContext } from 'react';
import { AuthContext } from '../context/auth/auth-context.ts';
import { useLocalStorage } from './use-local-storage.ts';

export interface User {
  email: string;
}

export const useUser = () => {
  const { user, setUser } = useContext(AuthContext);
  const { setItem } = useLocalStorage();

  const addUser = (user: User) => {
    setUser(user);
    setItem('user', JSON.stringify(user));
  };

  const removeUser = () => {
    setUser(null);
    setItem('user', '');
  };

  return { user, addUser, removeUser, setUser };
};
