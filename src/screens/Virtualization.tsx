import {
  MRT_ColumnDef,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import { Text } from "@mantine/core";

type Person = {
  firstName: string;
  email: string;
  phone: string;
  address: string;
  age: number;
};

const makeData = (length: number): Person[] =>
  [...Array(length).fill(null)].map(() => ({
    firstName: faker.person.firstName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    age: faker.number.int({ min: 18, max: 100 }),
  }));

const columns: MRT_ColumnDef<Person>[] = [
  { accessorKey: "firstName", header: "First Name", size: 150 },
  {
    accessorKey: "email",
    header: "Email",
    size: 300,
    Cell: ({ renderedCellValue }) => (
      <Text lineClamp={1}>{renderedCellValue}</Text>
    ),
  },
  { accessorKey: "phone", header: "Phone", size: 200 },
  {
    accessorKey: "address",
    header: "Address",
    size: 200,
    Cell: ({ renderedCellValue }) => (
      <Text lineClamp={2}>{renderedCellValue}</Text>
    ),
  },
];

/** Doc recommends to use only when you have over 50 rows and not using pagination */
export default function Virtualization() {
  const [data, setData] = useState<Person[]>([]);
  useEffect(() => {
    setData(makeData(10000));
  }, []);

  const table = useMantineReactTable({
    columns,
    data,
    enablePagination: false,
    enableRowVirtualization: true,
    enableStickyHeader: true,
    enableColumnResizing: true,
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
    state: {
      isLoading: !data.length,
    },
  });

  return <MantineReactTable table={table} />;
}
