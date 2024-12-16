import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance';
import { COURSES_URL } from '../../utils/consts/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const courseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  courseDuration: z.number(),
  lecturerId: z.number(),
  groupId: z.number(),
  scheduled: z.boolean(),
});

export type Course = z.infer<typeof courseSchema>;

const fetchCourses = async (): Promise<Course[]> => {
  const response = await apiInstance.get<Course[]>(COURSES_URL);
  return response.data;
};

const postCourse = async (course: Omit<Course, 'id'>) => {
  const response = await apiInstance.post<Course[]>(COURSES_URL, course);
  return response.data;
};

const editCourse = async (id: number, data: Partial<Course>) => {
  const response = await apiInstance.put<Course>(`${COURSES_URL}/${id}`, data);
  return response.data;
};

const deleteCourse = async (id: number) => {
  await apiInstance.delete(`${COURSES_URL}/${id}`);
};

// Queries & Mutations
export const useCoursesQuery = () => {
  return useQuery(['courses'], fetchCourses);
};

export const usePostCourseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(postCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
    },
  });
};

export const useEditCourseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: number; data: Partial<Course> }) =>
      editCourse(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['courses']);
      },
    }
  );
};

export const useDeleteCourseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
    },
  });
};
