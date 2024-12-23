import { apiInstance } from '../../utils/api-instance.ts';
import { COURSES_URL, USERS_URL } from '../../utils/consts/api.ts';
import { z } from 'zod';

const courseSchema = z.object({
  id: z.number(),
  name: z.string(),
  scheduled: z.boolean(),
  courseDuration: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  groupsIdList: z.array(z.number()),
  lecturerId: z.number(),
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
