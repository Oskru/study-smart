import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance.ts';
import { STUDENTS_URL } from '../../utils/consts/api.ts';

const studentSchema = z.object({
  indexNumber: z.string(),
  major: z.string(),
  groupId: z.number(),
  preferenceIdList: z.array(z.number()),
});

export type Student = z.infer<typeof studentSchema>;

export const fetchStudents = async (): Promise<Student[] | []> => {
  const response = await apiInstance.get<Student[] | []>(STUDENTS_URL);

  return response.data;
};

export const deleteStudent = async (id: number) => {
  await apiInstance.delete<Student[] | []>(`${STUDENTS_URL}/${id}`);
};
