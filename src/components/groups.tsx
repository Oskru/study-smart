import { useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import {
  Group,
  useDeleteGroupMutation,
  useEditGroupMutation,
  useGroupsQuery,
  usePostGroupMutation,
} from '../hooks/api/use-groups.ts';
import { useUser } from '../hooks/use-user.ts';
import { useStudentsQuery } from '../hooks/api/use-students.ts';
import Multiselect from 'multiselect-react-dropdown';

const GroupList = () => {
  const { user: currentUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { data: groupsData = [] } = useGroupsQuery();
  const { data: studentsData = [] } = useStudentsQuery();
  const selectedItems = useRef<any>();

  // Group Mutations
  const postGroupMutation = usePostGroupMutation();
  const editGroupMutation = useEditGroupMutation();
  const deleteGroupMutation = useDeleteGroupMutation();

  // group dialog states
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  const handleAddGroupOpen = () => {
    setCurrentGroup({ id: -1, name: '', studentIdList: [], courseIdList: [] });
    setAddGroupDialogOpen(true);
  };

  const handleEditGroupOpen = (id: number) => {
    const grp = groupsData.find(g => g.id === id);
    if (!grp) return;
    setCurrentGroup({
      id: grp.id,
      name: grp.name,
      studentIdList: grp.studentIdList,
      courseIdList: grp.courseIdList,
    });
    setEditGroupDialogOpen(true);
  };

  const handleAddGroupConfirm = () => {
    setAddGroupDialogOpen(false);
    const processedStudentIdList = currentGroup?.studentIdList || [];
    postGroupMutation.mutate(
      { ...currentGroup!, studentIdList: processedStudentIdList },
      {
        onSuccess: () => {
          enqueueSnackbar('Group added successfully!', { variant: 'success' });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error while adding group: ${error}`, {
            variant: 'error',
          });
        },
      }
    );
  };

  const handleEditGroupConfirm = (id: number) => {
    setEditGroupDialogOpen(false);

    const processed = selectedItems.current
      ?.getSelectedItems()
      .map((student: any) => student.id);

    editGroupMutation.mutate(
      { id, data: { studentIdList: processed, name: currentGroup?.name } },
      {
        onSuccess: () => {
          enqueueSnackbar('Group edited successfully!', { variant: 'success' });
        },
        onError: (error: any) => {
          enqueueSnackbar(`Error while editing group: ${error}`, {
            variant: 'error',
          });
        },
      }
    );
  };

  const handleDeleteGroup = (id: number) => {
    deleteGroupMutation.mutate(id, {
      onSuccess: () => {
        enqueueSnackbar('Group deleted successfully!', { variant: 'success' });
      },
      onError: (error: any) => {
        enqueueSnackbar(`Error deleting group: ${error}`, { variant: 'error' });
      },
    });
  };

  return (
    <>
      <Table sx={{ minWidth: 650, marginTop: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nazwa</TableCell>
            <TableCell>Studenci</TableCell>
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Options</TableCell>
            ) : null}
            {currentUser?.userRole === 'ADMIN' ? (
              <TableCell>Delete</TableCell>
            ) : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {groupsData.map(group => (
            <TableRow key={group.id}>
              <TableCell>{group.id}</TableCell>
              <TableCell>{group.name}</TableCell>
              <TableCell>
                {studentsData
                  .filter(student => group.studentIdList.includes(student.id))
                  .map(student => student.indexNumber)
                  .join(', ')}
              </TableCell>
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell>
                  <IconButton onClick={() => handleEditGroupOpen(group.id)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              )}
              {currentUser?.userRole === 'ADMIN' && (
                <TableCell>
                  <IconButton onClick={() => handleDeleteGroup(group.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ADD/EDIT GROUP DIALOG */}
      <Dialog
        open={editGroupDialogOpen || addGroupDialogOpen}
        onClose={() =>
          editGroupDialogOpen
            ? setEditGroupDialogOpen(false)
            : setAddGroupDialogOpen(false)
        }
      >
        <DialogTitle>
          {editGroupDialogOpen ? 'Edit Group' : 'Add Group'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label='Name'
            value={currentGroup?.name || ''}
            onChange={e =>
              setCurrentGroup(prev => ({ ...prev!, name: e.target.value }))
            }
            fullWidth
            margin='dense'
          />
          <Multiselect
            style={{
              multiselectContainer: { height: '500px' },
              option: { color: 'blue' },
            }}
            options={studentsData.map(student => ({
              name: `${student.lastName}, ${student.indexNumber}`,
              id: student.id,
            }))}
            displayValue='name'
            selectedValues={
              editGroupDialogOpen && currentGroup?.id
                ? studentsData
                    .filter(student =>
                      groupsData
                        .find(g => g.id === currentGroup.id)
                        ?.studentIdList.includes(student.id)
                    )
                    .map(student => ({
                      name: `${student.lastName}, ${student.indexNumber}`,
                      id: student.id,
                    }))
                : []
            }
            showCheckbox
            ref={selectedItems}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              editGroupDialogOpen
                ? setEditGroupDialogOpen(false)
                : setAddGroupDialogOpen(false)
            }
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              editGroupDialogOpen
                ? handleEditGroupConfirm(currentGroup?.id ?? -1)
                : handleAddGroupConfirm()
            }
            color='primary'
          >
            {editGroupDialogOpen ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color='primary'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        aria-label='add'
        onClick={handleAddGroupOpen}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default GroupList;
