import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance';
import { LECTURERS_URL } from '../../utils/consts/api';
import { courseSchema } from './use-courses';
import { availabilitySchema } from './use-availabilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const lecturerSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
  role: z.string(),
  department: z.string(),
  title: z.string(),
  classRoom: z.string(),
  officeNumber: z.string(),
  confirmed: z.boolean(),
  courses: z.array(courseSchema),
  availabilities: z.array(availabilitySchema),
});

export type Lecturer = z.infer<typeof lecturerSchema>;

const fetchLecturers = async (): Promise<Lecturer[]> => {
  const response = await apiInstance.get<Lecturer[]>(LECTURERS_URL);
  return response.data;
};

const putAddCourseToLecturer = async (lecturerId: number, courseId: number) => {
  await apiInstance.put(
    `${LECTURERS_URL}/${lecturerId}/add-course/${courseId}`
  );
};

const deleteLecturer = async (id: number) => {
  await apiInstance.delete(`${LECTURERS_URL}/${id}`);
};

export const useLecturersQuery = () => {
  return useQuery(['lecturers'], fetchLecturers);
};

export const usePutAddCourseToLecturerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ lecturerId, courseId }: { lecturerId: number; courseId: number }) =>
      putAddCourseToLecturer(lecturerId, courseId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['lecturers']);
      },
    }
  );
};

export const useDeleteLecturerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteLecturer, {
    onSuccess: () => {
      queryClient.invalidateQueries(['lecturers']);
    },
  });
};
