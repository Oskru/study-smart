import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance';
import { USERS_URL } from '../../utils/consts/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
});

export type User = z.infer<typeof userSchema>;

const fetchUsers = async (onlyStudents?: boolean): Promise<User[]> => {
  const response = await apiInstance.get<User[]>(USERS_URL);
  const data = response.data;
  if (onlyStudents) {
    return data.filter(student => student.role === 'STUDENT');
  }
  return data;
};

const deleteUser = async (id: number) => {
  const response = await apiInstance.delete<User[] | []>(`${USERS_URL}/${id}`);
  return response.data;
};

export const useUsersQuery = (onlyStudents?: boolean) => {
  return useQuery(['users', { onlyStudents }], () => fetchUsers(onlyStudents));
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
