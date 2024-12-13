import { apiInstance } from '../../utils/api-instance.ts';
import { util, z } from 'zod';
import { PREFERENCES_URL } from '../../utils/consts/api.ts';
import Omit = util.Omit;
import Preferences from '../../components/preferences.tsx';

const preferenceSchema = z.object({
  id: z.number().nullable(),
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
  studentId: z.number(),
  courseId: z.number(), // do wyrzucenia?
});

const preferencesSchema = z.union([
  z.array(preferenceSchema),
  z.array(z.any()),
]);

export type Preference = z.infer<typeof preferenceSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

export const fetchPreferences = async (): Promise<Preferences> => {
  const response = await apiInstance.get<Preference[]>(PREFERENCES_URL);

  return response.data;
};

export const postPreference = async (preference: Omit<Preference, 'id'>) => {
  await apiInstance.post<Preferences>(PREFERENCES_URL, preference);
};

export const fetchPreferencesByIds = async (
  preferenceIds: number[]
): Promise<Preference[]> => {
  const preferences = await fetchPreferences();
  return preferences.filter(preference =>
    preferenceIds.includes(preference.id)
  );
};

export const deletePreference = async (id: number) => {
  await apiInstance.delete<Preferences>(`${PREFERENCES_URL}/${id}`);
};
