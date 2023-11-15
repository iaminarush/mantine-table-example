import { ActionIcon, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { Book, sleep } from "../App";
import { EditNumberComponent } from "../Components/EditNumberComponent";
import { EditSelectComponent } from "../Components/EditSelectComponent";
import { EditTextComponent } from "../Components/EditTextComponent";

const patchBooks = async (value: Book) => {
  return sleep(1000).then(() => {
    return value;
  });
};

const useMutateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchBooks,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["books"] });

      const previousBooks = queryClient.getQueryData<Book[]>(["books"]);

      queryClient.setQueryData<Book[]>(["books"], (oldData) => {
        if (!oldData) return undefined;

        const index = oldData.findIndex((b) => b.id === data.id);

        if (index !== -1) {
          const newData = produce(oldData, (draft) => {
            draft[index] = data;
          });
          return newData;
        } else {
          return oldData;
        }
      });

      return previousBooks;
    },
    onError: (err, newBook, context) => {
      console.log("error", err);
      queryClient.setQueryData(["books"], context);
    },
  });
};

const getBooks = async () => {
  const response: Promise<{ data: Book[] }> = (
    await fetch("https://fakerapi.it/api/v1/books?_quantity=3")
  ).json();
  return (await response).data;
};

export default function CellEdit() {
  const books = useQuery({ queryKey: ["books"], queryFn: getBooks });
  const mutateBook = useMutateBook();

  const handleIdUpdate = (value: number | "", cell: MRT_Cell<Book>) => {
    const newData = { ...cell.row.original };
    if (typeof value === "number") {
      newData.id = value;
      mutateBook.mutate(newData);
    }
  };

  const handleAuthorUpdate = (value: string, cell: MRT_Cell<Book>) => {
    const newData = { ...cell.row.original };
    newData.author = value;
    mutateBook.mutate(newData);
  };

  const handleTitleUpdate = (value: string | null, cell: MRT_Cell<Book>) => {
    const newData = { ...cell.row.original };
    newData.title = value || "";
    mutateBook.mutate(newData);
  };

  const columns: MRT_ColumnDef<Book>[] = [
    {
      accessorKey: "title",
      header: "Title",
      Edit: (props) => (
        <EditSelectComponent
          {...props}
          data={["a", "b", "c"]}
          onSave={handleTitleUpdate}
          clearable
        />
      ),
    },
    {
      accessorKey: "author",
      header: "Author",
      Edit: ({ cell, column, table }) => (
        <EditTextComponent
          cell={cell}
          column={column}
          table={table}
          validate={(value) => (!value ? "Required" : undefined)}
          onSave={handleAuthorUpdate}
        />
      ),
    },
    {
      accessorKey: "id",
      header: "Id",
      Edit: (props) => (
        <EditNumberComponent
          {...props}
          validate={(value) => {
            console.log(value);
            if (!value && value !== 0) {
              return "Required";
            }
            if (typeof value !== "number") {
              return "Must be number";
            }
          }}
          onSave={handleIdUpdate}
        />
      ),
    },
  ];

  const table = useMantineReactTable({
    columns,
    data: books?.data || [],
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Reload Data">
        <ActionIcon onClick={() => books.refetch()}>
          <IconRefresh />
        </ActionIcon>
      </Tooltip>
    ),
    state: {
      isLoading: books.isLoading,
      showProgressBars: books.isRefetching || mutateBook.isPending,
    },
    enableStickyHeader: true,
    enableStickyFooter: true,
    mantinePaperProps: { sx: { borderWidth: 0 } },
    mantineTableContainerProps: {
      sx: { minHeight: 350, height: "78vh" },
    },
    editDisplayMode: "cell",
    enableEditing: true,
  });

  return (
    <>
      <MantineReactTable table={table} />
    </>
  );
}
