import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiInstance } from '../../utils/api-instance';
import { z } from 'zod';
import { AVAILABILITIES_URL } from '../../utils/consts/api';
import { dayNameSchema } from './use-preferences.ts';

export const availabilitySchema = z.object({
  id: z.number(),
  dayId: z.number(),
  dayName: dayNameSchema,
  times: z.array(z.string()),
  timeRanges: z.array(z.array(z.string())),
  lecturerId: z.number(),
});

const availabilitiesSchema = z.array(availabilitySchema);

export type Availability = z.infer<typeof availabilitySchema>;
export type Availabilities = z.infer<typeof availabilitiesSchema>;

const fetchAvailabilities = async (): Promise<Availabilities> => {
  const response = await apiInstance.get<Availability[]>(AVAILABILITIES_URL);
  return response.data;
};

const postAvailability = async (availability: Omit<Availability, 'id'>[]) => {
  await apiInstance.post<Availabilities>(AVAILABILITIES_URL, availability);
};

const deleteAvailability = async (id: number) => {
  await apiInstance.delete(`${AVAILABILITIES_URL}/${id}`);
};

// Queries & Mutations
export const useAvailabilitiesQuery = () => {
  return useQuery(['availabilities'], fetchAvailabilities);
};

export const usePostAvailabilityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(postAvailability, {
    onSuccess: () => {
      queryClient.invalidateQueries(['availabilities']);
    },
  });
};

export const useDeleteAvailabilityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAvailability, {
    onSuccess: () => {
      queryClient.invalidateQueries(['availabilities']);
    },
  });
};
