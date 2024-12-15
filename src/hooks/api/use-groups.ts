import { z } from 'zod';
import { apiInstance } from '../../utils/api-instance';
import { GROUPS_URL } from '../../utils/consts/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const groupSchema = z.object({
  id: z.number(),
  name: z.string(),
  studentIdList: z.array(z.number()),
  courseIdList: z.array(z.number()),
});

export type Group = z.infer<typeof groupSchema>;
export type Groups = Group[];

const fetchGroups = async (): Promise<Groups> => {
  const response = await apiInstance.get<Groups>(GROUPS_URL);
  return response.data;
};

const fetchGroupById = async (id: number): Promise<Group> => {
  const response = await apiInstance.get<Group>(`${GROUPS_URL}/${id}`);
  return response.data;
};

const postGroup = async (group: Omit<Group, 'id'>) => {
  const response = await apiInstance.post<Group[] | []>(GROUPS_URL, group);
  return response.data;
};

const editGroup = async (id: number, data: Partial<Group>) => {
  const response = await apiInstance.put<Group>(`${GROUPS_URL}/${id}`, data);
  return response.data;
};

const deleteGroup = async (id: number) => {
  await apiInstance.delete(`${GROUPS_URL}/${id}`);
};

// Queries & Mutations
export const useGroupsQuery = () => {
  return useQuery(['groups'], fetchGroups);
};

export const useGroupByIdQuery = (id: number) => {
  return useQuery(['groups', id], () => fetchGroupById(id), {
    enabled: !!id,
  });
};

export const usePostGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(postGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
    },
  });
};

export const useEditGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: number; data: Partial<Group> }) => editGroup(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['groups']);
      },
    }
  );
};

export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
    },
  });
};
