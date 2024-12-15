import { apiInstance } from '../../utils/api-instance.ts';
import { GROUPS_URL } from '../../utils/consts/api.ts';
import { z } from 'zod';

const groupSchema = z.object({
  id: z.number(),
  name: z.string(),
  studentIdList: z.array(z.number()),
  courseIdList: z.array(z.number()),
});

const groupsSchema = z.union([z.array(groupSchema), z.array(z.any())]);

export type Group = z.infer<typeof groupSchema>;
export type Groups = z.infer<typeof groupsSchema>;

export const fetchGroups = async (): Promise<Groups> => {
  const response = await apiInstance.get<Groups>(GROUPS_URL);

  return response.data;
};

export const fetchGroupById = async (id: number): Promise<Group> => {
  const response = await apiInstance.get<Group>(`${GROUPS_URL}/${id}`);
  return response.data;
};

export const postGroup = async (
  group: Omit<Group, 'id'>
): Promise<Group[] | []> => {
  const response = await apiInstance.post<Group[] | []>(GROUPS_URL, group);
  return response.data;
};

export const editGroup = async (
  id: number,
  data: Partial<Group>
): Promise<Group> => {
  // Wyślij żądanie do API, np.:
  const response = await apiInstance.put<Group>(`${GROUPS_URL}/${id}`, data);
  return response.data;
};

export const deleteGroup = async (id: number) => {
  await apiInstance.delete<Group[] | []>(`${GROUPS_URL}/${id}`);
};
