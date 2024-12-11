import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance.ts';
import { USERS_URL } from '../../utils/consts/api.ts';

const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const fetchUsers = async (
  onlyStudents?: boolean
): Promise<User[] | []> => {
  const response = await apiInstance.get<User[] | []>(USERS_URL);

  if (onlyStudents) {
    return response.data.filter(student => student.email.includes('@student'));
  }

  return response.data;
};

export const deleteUser = async (id: number): Promise<User[] | []> => {
  const response = await apiInstance.delete<User[] | []>(`${USERS_URL}/${id}`);

  return response.data;
};
