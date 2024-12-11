import {
  InvalidateOptions,
  InvalidateQueryFilters,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { apiInstance } from '../../utils/api-instance.ts';
import { z } from 'zod';
import { PREFERENCES_URL } from '../../utils/consts/api.ts';

const preferenceSchema = z.object({
  id: z.number(),
  dayOfWeek: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  startTime: z.string(),
  endTime: z.string(),
  studentId: z.number(), // Optional for when the preference is for a lecturer
  courseId: z.number(),
});

const preferencesSchema = z.union([
  z.array(preferenceSchema),
  z.array(z.any()),
]);

export type Preference = z.infer<typeof preferenceSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

export const fetchPreferences = async (): Promise<Preferences> => {
  const response = await apiInstance.get<Preferences>(PREFERENCES_URL);

  return response.data;
};

export const postPreference = async (preference: Omit<Preference, 'id'>) => {
  await apiInstance.post<Preferences>(
    PREFERENCES_URL,
    JSON.stringify(preference)
  );
};

export const deletePreference = async (id: number) => {
  await apiInstance.delete<Preferences>(`PREFERENCES_URL/${id}`);
};

// const preferencesQueryOptions: UseQueryOptions = {
//   queryKey: ['preferences'],
//   queryFn: fetchPreferences,
// };
//
// export function useGetPreferences() {
//   const queryClient = useQueryClient();
//
//   const postMutation = useMutation({
//     mutationFn: postPreference,
//     onSuccess: () => {
//       queryClient.invalidateQueries('preferences');
//     },
//   });
//
//   const deleteMutation = useMutation({
//     mutationFn: deletePreference,
//     onSuccess: () => {
//       queryClient.invalidateQueries('preferences');
//     },
//   });
//
//   const { data, isLoading } = useQuery<Preferences>(preferencesQueryOptions);
//
//   return {
//     preferences: data,
//     isLoading,
//     postPreference: postMutation,
//     deletePreference: deleteMutation,
//   };
// }
