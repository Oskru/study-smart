import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance';
import { PREFERENCES_URL } from '../../utils/consts/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const dayNameSchema = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

const preferenceSchema = z.object({
  id: z.number(),
  dayId: z.number(),
  dayName: dayNameSchema,
  times: z.array(z.string()),
  timeRanges: z.array(z.array(z.string())),
  studentId: z.number(),
  courseId: z.number(),
});

export type Preference = z.infer<typeof preferenceSchema>;
export type Preferences = Preference[];
export type WeekDayName = z.infer<typeof dayNameSchema>;

const fetchPreferences = async (): Promise<Preferences> => {
  const response = await apiInstance.get<Preference[]>(PREFERENCES_URL);
  return response.data;
};

const postPreference = async (preference: Omit<Preference, 'id'>[]) => {
  await apiInstance.post<Preferences>(PREFERENCES_URL, preference);
};

const deletePreference = async (id: number) => {
  await apiInstance.delete(`${PREFERENCES_URL}/${id}`);
};

export const usePreferencesQuery = () => {
  return useQuery(['preferences'], fetchPreferences);
};

export const usePostPreferenceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(postPreference, {
    onSuccess: () => {
      queryClient.invalidateQueries(['preferences']);
    },
  });
};

export const useDeletePreferenceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePreference, {
    onSuccess: () => {
      queryClient.invalidateQueries(['preferences']);
    },
  });
};
