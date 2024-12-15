import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance';
import { STUDENTS_URL } from '../../utils/consts/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const studentSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  indexNumber: z.string(),
  major: z.string(),
  groupId: z.number(),
  preferenceIdList: z.array(z.number()),
});

export type Student = z.infer<typeof studentSchema>;

const fetchStudents = async (): Promise<Student[]> => {
  const response = await apiInstance.get<Student[]>(STUDENTS_URL);
  return response.data;
};

const deleteStudent = async (id: number) => {
  await apiInstance.delete(`${STUDENTS_URL}/${id}`);
};

export const useStudentsQuery = () => {
  return useQuery(['students'], fetchStudents);
};

export const useDeleteStudentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteStudent, {
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
    },
  });
};
