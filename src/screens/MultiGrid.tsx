import { Button, Grid } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MRT_ColumnDef,
  MRT_RowSelectionState,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useEffect, useState } from "react";
import { sleep } from "../App";
import { produce } from "immer";

const permissions: Permission[] = [
  { id: 1, name: "read" },
  { id: 2, name: "edit" },
];

type User = {
  id: number;
  name: string;
  permissions: number[];
};

type Permission = {
  id: number;
  name: string;
};

const userData: User[] = [
  { id: 1, name: "User 1", permissions: [1] },
  { id: 2, name: "User 2", permissions: [2] },
];

const getUsers = async () => {
  return new Promise<User[]>(function (resolve, reject) {
    resolve([...userData]);
  });
};

const patchUser = async (value: User) => {
  return sleep(500).then(() => {
    return value;
  });
};

const useMutateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchUser,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });

      const previousUsers = queryClient.getQueryData<User[]>(["users"]);

      queryClient.setQueryData<User[]>(["users"], (oldData) => {
        if (!oldData) return undefined;

        const index = oldData.findIndex((u) => u.id === data.id);

        if (index !== -1) {
          const newData = produce(oldData, (draft) => {
            draft[index] = data;
          });
          return newData;
        } else {
          return oldData;
        }
      });
      return previousUsers;
    },
    onError: (err, newUser, context) =>
      queryClient.setQueryData(["users"], context),
  });
};

export default function MultiGrid() {
  const users = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const mutateUser = useMutateUser();
  const [userRow, setUserRow] = useState<MRT_RowSelectionState>({});
  const [permissionRow, setPermissionRow] = useState<MRT_RowSelectionState>({});
  const [edited, setEdited] = useState(false);

  const userColumns: MRT_ColumnDef<User>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Permission(s)",
      accessorFn: (data) => {
        const _permissions: string[] = [];

        data.permissions.forEach((p) => {
          const permission = permissions.find((pd) => pd.id === p);
          if (permission) {
            _permissions.push(permission.name);
          }
        });

        if (!_permissions.length) {
          return "No permissions";
        } else {
          return _permissions.join(", ");
        }
      },
    },
  ];

  const permissionColumns: MRT_ColumnDef<Permission>[] = [
    { header: "Name", accessorKey: "name" },
  ];

  const handleUpdate = () => {
    const user = userTable.getSelectedRowModel().rows[0]?.original;
    const permissions = permissionTable
      .getSelectedRowModel()
      .rows.map((r) => r.original.id);
    if (user) {
      const updatedUser = produce(user, (draft) => {
        draft.permissions = permissions;
      });
      console.log(updatedUser);
      mutateUser.mutate(updatedUser, { onSuccess: () => setEdited(false) });
    }
  };

  const userTable = useMantineReactTable({
    columns: userColumns,
    data: users.data || [],
    enableRowSelection: true,
    enableMultiRowSelection: false,
    // onRowSelectionChange: setUserRow,
    onRowSelectionChange: (e) => {
      setUserRow(e);
      setEdited(false);
    },
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => row.toggleSelected(),
      sx: { cursor: "pointer" },
    }),
    state: { rowSelection: userRow },
    renderBottomToolbarCustomActions: () => (
      <Button
        disabled={!edited}
        onClick={handleUpdate}
        loading={mutateUser.isPending}
      >
        Save
      </Button>
    ),
  });

  const permissionTable = useMantineReactTable({
    columns: permissionColumns,
    data: permissions,
    enableRowSelection: () => !!Object.keys(userRow).length,
    // onRowSelectionChange: setPermissionRow,
    onRowSelectionChange: (e) => {
      setPermissionRow(e);
      setEdited(true);
    },
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => row.toggleSelected(),
      sx: { cursor: "pointer" },
    }),
    state: { rowSelection: permissionRow },
    getRowId: (row) => `${row.id}`,
  });

  useEffect(() => {
    const selectedRows = userTable.getSelectedRowModel().rows;
    const permissions = selectedRows[0]?.original.permissions;

    const _permissionRow: MRT_RowSelectionState = {};

    if (permissions) {
      permissions.forEach((p) => {
        _permissionRow[`${p}`] = true;
      });
    }
    setPermissionRow(_permissionRow);
  }, [userRow]);

  return (
    <Grid sx={{ height: "100%", flex: 1 }} gutter="xs" py="md">
      <Grid.Col xs={6}>
        <MantineReactTable table={userTable} />
      </Grid.Col>
      <Grid.Col xs={6}>
        <MantineReactTable table={permissionTable} />
      </Grid.Col>
    </Grid>
  );
}
