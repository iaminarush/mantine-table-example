import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useImmer } from "use-immer";
import { Book, sleep } from "../App";
import { EditNumberComponent } from "../Components/EditNumberComponent";
import { EditSelectComponent } from "../Components/EditSelectComponent";
import { EditTextComponent } from "../Components/EditTextComponent";

const getBooks = async () => {
  const response: Promise<{ data: Book[] }> = (
    await fetch("https://fakerapi.it/api/v1/books?_quantity=100")
  ).json();
  return (await response).data;
};

const patchBook = async (value: Book) => {
  return sleep(1000).then(() => {
    return value;
  });
};

const patchBooks = async (value: Book[]) => {
  const result = await Promise.all(value.map((b) => patchBook(b)));
  return result;
};

const useMutateBooks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchBooks,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["books"] });

      const previousBooks = queryClient.getQueryData<Book[]>(["books"]);

      queryClient.setQueryData<Book[]>(["books"], (oldData) => {
        if (!oldData) return undefined;

        const newData = produce(oldData, (draft) => {
          data.forEach((newBook) => {
            const index = draft.findIndex((d) => d.id === newBook.id);
            if (index !== -1) {
              draft[index] = newBook;
            }
          });
        });

        return newData;
      });
      return previousBooks;
    },
  });
};

export default function GroupEdit() {
  const books = useQuery({ queryKey: ["books"], queryFn: getBooks });
  const mutateBook = useMutateBooks();
  const [editedBooks, updateEditedBooks] = useImmer<Book[]>([]);

  const handleAuthorUpdate = (value: string, cell: MRT_Cell<Book>) => {
    console.log(cell.row.original);
    const index = editedBooks.findIndex((b) => b.id === cell.row.original.id);
    if (index !== -1) {
      updateEditedBooks((draft) => {
        draft[index]!.author = value;
      });
    } else {
      const newEditedBook = produce(cell.row.original, (draft) => {
        draft.author = value;
      });
      updateEditedBooks((draft) => {
        draft.push(newEditedBook);
      });
    }
  };

  const columns: MRT_ColumnDef<Book>[] = [
    {
      accessorKey: "title",
      header: "Title",
      Edit: (props) => (
        <EditSelectComponent
          {...props}
          data={["a", "b", "c"]}
          // onSave={handleTitleUpdate}
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
          // onSave={handleIdUpdate}
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
    // enableStickyFooter: true,
    mantinePaperProps: {
      sx: {
        height: "100%",
        minHeight: 350,
        display: "flex",
        flex: 1,
        flexDirection: "column",
      },
    },
    mantineTableContainerProps: {
      sx: {
        height: 0,
        minHeight: 0,
        overflow: "auto",
        flex: "1 1 auto",
      },
    },
    editDisplayMode: "cell",
    enableEditing: true,
    renderBottomToolbarCustomActions: () => (
      <Button
        disabled={!editedBooks.length}
        loading={mutateBook.isPending}
        onClick={() =>
          mutateBook.mutate(editedBooks, {
            onSuccess: () => updateEditedBooks(() => []),
          })
        }
      >
        Save
      </Button>
    ),
  });

  return <MantineReactTable table={table} />;
}
