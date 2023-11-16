import { Button } from "@mantine/core";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_SortingState,
  MRT_Virtualizer,
  useMantineReactTable,
} from "mantine-react-table";
import { useMemo, useRef, useState } from "react";

const fetchSize = 25;

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
};

type ProductApiResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

const columns: MRT_ColumnDef<Product>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
];

export default function InfiniteScroll() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef =
    useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState<string>();
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { data, fetchNextPage, isError, isFetching, isLoading } =
    useInfiniteQuery({
      queryKey: ["table-data"],
      queryFn: async ({ pageParam }) => {
        const response = await axios.get<ProductApiResponse>(
          "https://dummyjson.com/products",
          {
            params: {
              limit: fetchSize,
              skip: fetchSize * pageParam,
            },
          }
        );

        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      // getNextPageParam: (_lastGroup, groups) => groups.length,
    });

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  console.log(data, flatData);

  // const table = usemantinereacttable({
  //   columns,
  //   data: data
  // });

  // const example = useInfiniteQuery({
  //   queryKey: ["users"],
  //   queryFn: async ({pageParam}) => {},
  //   initialPageParam: 0,
  //   getNextPageParam: (lastPage, pages) => lastPage.nextC,
  // });

  return (
    <>
      <Button onClick={() => fetchNextPage()}>Next</Button>
    </>
  );
}
