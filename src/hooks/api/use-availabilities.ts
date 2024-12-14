import { apiInstance } from '../../utils/api-instance.ts';
import { util, z } from 'zod';
import { AVAILABILITIES_URL } from '../../utils/consts/api.ts';
import Omit = util.Omit;

export const availabilitySchema = z.object({
  id: z.number(),
  dayId: z.number(),
  dayName: z.enum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]),
  times: z.array(z.string()),
  timeRanges: z.array(z.string()),
  lecturerId: z.number(),
});

const availabilitiesSchema = z.union([
  z.array(availabilitySchema),
  z.array(z.any()),
]);

export type Availability = z.infer<typeof availabilitySchema>;
export type Availabilities = z.infer<typeof availabilitiesSchema>;

export const fetchAvailabilties = async (): Promise<Availabilities> => {
  const response = await apiInstance.get<Availability[]>(AVAILABILITIES_URL);

  return response.data;
};

export const postAvailability = async (
  availability: Omit<Availability, 'id'>
) => {
  await apiInstance.post<Availabilities>(AVAILABILITIES_URL, availability);
};

export const fetchAvailabiltiesById = async (
  availabilityIds: number[]
): Promise<Availability[]> => {
  const availabilities = await fetchAvailabilties();
  return availabilities.filter(availability =>
    availabilityIds.includes(availability.id)
  );
};

export const deleteAvailability = async (id: number) => {
  await apiInstance.delete<Availabilities>(`${AVAILABILITIES_URL}/${id}`);
};
