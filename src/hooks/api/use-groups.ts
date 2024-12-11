import { apiInstance } from '../../utils/api-instance.ts';
import { GROUPS_URL } from '../../utils/consts/api.ts';
import { z } from 'zod';

const groupSchema = z.object({
  id: z.number(),
  name: z.string(),
  studentIdList: z.array(z.number()),
});

export type Group = z.infer<typeof groupSchema>;

export const fetchGroups = async (): Promise<Group[] | []> => {
  const response = await apiInstance.get<Group[] | []>(GROUPS_URL);

  return response.data;
};

export const fetchGroupById = async (groupId: number): Promise<Group> => {
  const response = await apiInstance.post<Group>(`${GROUPS_URL}/bulk`, {
    ids: groupId,
  });
  return response.data;
};

export const postGroup = async (
  group: Omit<Group, 'id'>
): Promise<Group[] | []> => {
  const response = await apiInstance.post<Group[] | []>(
    GROUPS_URL,
    JSON.stringify(group)
  );

  return response.data;
};

export const deleteGroup = async (id: number) => {
  await apiInstance.delete<Group[] | []>(`${GROUPS_URL}/${id}`);
};
