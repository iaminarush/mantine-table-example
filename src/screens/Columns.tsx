import { Stack, Switch, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useMemo, useState } from "react";
import { Book } from "../App";

const getBooks = async () => {
  const response: Promise<{ data: Book[] }> = (
    await fetch("https://fakerapi.it/api/v1/books?_quantity=10")
  ).json();
  return (await response).data;
};

export default function Columns() {
  const books = useQuery({ queryKey: ["books"], queryFn: getBooks });
  const [checked, setChecked] = useState(false);

  const columns = useMemo<MRT_ColumnDef<Book>[]>(() => {
    return [
      ...(checked ? [{ header: "Optional" }] : []),
      { header: "Title", accessorKey: "title" },
      { header: "Author", accessorKey: "author", enableResizing: false },
      { header: "Genre", accessorKey: "genre", size: 100 },
      {
        header: "Description",
        accessorFn: (b) => <Text lineClamp={2}>{b.description}</Text>,
        accessorKey: "description",
        minSize: 400,
      },
      { header: "ISBN", accessorKey: "isbn", size: 120 },
    ];
  }, [checked]);

  const table = useMantineReactTable({
    columns,
    data: books.data || [],
    mantineTableProps: {
      sx: {
        tableLayout: "fixed",
      },
    },
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
    defaultColumn: { minSize: 80 },
    enableColumnResizing: true,
    // Set column order to empty array to use column's original ordering
    state: { columnOrder: [] },
  });

  return (
    <Stack h="100%" sx={{ flexGrow: 1 }} py={4}>
      <Switch
        checked={checked}
        onChange={(e) => setChecked(e.currentTarget.checked)}
        label="Toggle Column"
      />
      <MantineReactTable table={table} />
    </Stack>
  );
}
