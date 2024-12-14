import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance.ts';
import { LECTURERS_URL } from '../../utils/consts/api.ts';
import { courseSchema } from './use-courses.ts';
import { availabilitySchema } from './use-availabilities.ts';

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

export const fetchLecturers = async (): Promise<Lecturer[] | []> => {
  const response = await apiInstance.get<Lecturer[] | []>(LECTURERS_URL);

  return response.data;
};

export const putAddCourseToLecturer = async (
  lecturerId: number,
  courseId: number
) => {
  await apiInstance.put(
    `${LECTURERS_URL}/${lecturerId}/add-course/${courseId}}`
  );
};

export const fetchLecturerById = async (
  lecturerId: number
): Promise<Lecturer[]> => {
  const lecturer = await fetchLecturers();
  return lecturer.filter(lecturer => lecturerId === lecturer.id);
};

export const deleteLecturer = async (id: number) => {
  await apiInstance.delete<Lecturer[] | []>(`${LECTURERS_URL}/${id}`);
};
