import { useUser } from './use-user.ts';
import { useNavigate } from 'react-router-dom';
import { LOGIN_URL } from '../utils/consts/api.ts';
import { AxiosResponse } from 'axios';
import { AuthResponse } from '../types/api-response.ts';
import { apiInstance } from '../utils/api-instance.ts';

const REGISTER_STUDENT_URL = `/auth/registerStudent`;
const REGISTER_LECTURER_URL = `/auth/registerLecturer`;

interface StudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  indexNumber: string;
  major: string;
}

interface LecturerPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  title: string;
  classRoom: string;
  officeNumber: string;
}

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
    } else {
      return { error: true };
    }

    return { error: false };
  };

  const logout = () => {
    removeUser();
    navigate('/login');
  };

  const registerStudent = async (payload: StudentPayload) => {
    const { data, status } = await apiInstance.post<
      any,
      AxiosResponse<AuthResponse>
    >(REGISTER_STUDENT_URL, payload);

    if (status === 201 && data.token) {
      addUser(data.token);
      navigate('/');
    }
  };

  const registerLecturer = async (payload: LecturerPayload) => {
    const { status } = await apiInstance.post(REGISTER_LECTURER_URL, payload);

    if (status === 201) {
      // Lecturer doesn't get a token
      // Navigate to a confirmation page
      navigate('/lecturer-confirmation');
    }
  };

  return {
    user,
    token,
    login,
    logout,
    registerStudent,
    registerLecturer,
  };
};
