import { useEffect } from 'react';
import { useUser, User } from './use-user.ts';
import { useLocalStorage } from './use-local-storage.ts';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, addUser, removeUser, setUser } = useUser();
  const { getItem } = useLocalStorage();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getItem('user');
    if (user) {
      addUser(JSON.parse(user));
    }
  }, [addUser, getItem]);

  const login = (user: User) => {
    addUser(user);
    navigate('/');
  };

  const logout = () => {
    removeUser();
    navigate('/login');
  };

  return { user, login, logout, setUser };
};
