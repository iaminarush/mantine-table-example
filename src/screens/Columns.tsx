import {
  MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { Book } from "../App";
import { useQuery } from "@tanstack/react-query";
import { Stack, Switch, Text } from "@mantine/core";
import { useMemo, useState } from "react";

const getBooks = async () => {
  const response: Promise<{ data: Book[] }> = (
    await fetch("https://fakerapi.it/api/v1/books?_quantity=100")
  ).json();
  return (await response).data;
};

export default function Columns() {
  const books = useQuery({ queryKey: ["books"], queryFn: getBooks });
  const [checked, setChecked] = useState(false);

  // const columns: MRT_ColumnDef<Book>[] = [
  //   { header: "Title", accessorKey: "title" },
  //   { header: "Author", accessorKey: "author", enableResizing: false },
  //   { header: "Genre", accessorKey: "genre", size: 100 },
  //   {
  //     header: "Description",
  //     accessorFn: (b) => <Text lineClamp={2}>{b.description}</Text>,
  //     accessorKey: "description",
  //     minSize: 400,
  //   },
  //   { header: "ISBN", accessorKey: "isbn", size: 120 },
  // ];

  const columns = useMemo<MRT_ColumnDef<Book>[]>(() => {
    return [
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
    // layoutMode: "semantic",
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
  });

  return (
    <Stack h="100%" sx={{ flexGrow: 1 }}>
      <Switch
        checked={checked}
        onChange={(e) => setChecked(e.currentTarget.checked)}
      />
      <MantineReactTable table={table} />
    </Stack>
  );
}
