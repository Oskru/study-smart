import { apiInstance } from '../../utils/api-instance.ts';
import { COURSES_URL } from '../../utils/consts/api.ts';
import { z } from 'zod';

export const courseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  courseDuration: z.number(),
  lecturerId: z.number(),
  scheduled: z.boolean(),
});

export type Course = z.infer<typeof courseSchema>;

export const fetchCourses = async (): Promise<Course[] | []> => {
  const response = await apiInstance.get<Course[] | []>(COURSES_URL);

  return response.data;
};

export const postCourse = async (
  course: Omit<Course, 'id'>
): Promise<Course[] | []> => {
  const response = await apiInstance.post<Course[] | []>(
    COURSES_URL,
    JSON.stringify(course)
  );

  return response.data;
};

export const deleteCourse = async (id: number) => {
  await apiInstance.delete<Course[] | []>(`${COURSES_URL}/${id}`);
};
