import { Text } from "@mantine/core";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  MRT_ColumnDef,
  MRT_SortingState,
  MRT_Virtualizer,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const fetchSize = 25;

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
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
  {
    accessorKey: "category",
    header: "Category",
  },
];

export default function InfiniteScroll() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef =
    useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null);

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
      getNextPageParam: (lastPage, page) => {
        //When current length matches server's total, skip last fetch
        if (page.length * fetchSize >= lastPage.total) {
          return undefined;
        }
        return page.length;
      },
    });

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.products) ?? [],
    [data]
  );

  const totalDBRows = data?.pages?.[0]?.total || 0;
  const totalFetched = flatData.length;

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

        if (
          //If user has scrolled within 400px of the bottom of the table
          scrollHeight - scrollTop - clientHeight < 400 &&
          //wait for current fetch to finish
          !isFetching &&
          totalFetched < totalDBRows
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRows]
  );

  const table = useMantineReactTable({
    columns,
    data: flatData,
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
      ref: tableContainerRef,
      sx: {
        height: 0,
        minHeight: 0,
        overflow: "auto",
        flex: "1 1 auto",
      },
      onScroll: (e) => fetchMoreOnBottomReached(e.target as HTMLDivElement),
    },
    mantineToolbarAlertBannerProps: {
      color: "red",
      children: "Error",
    },
    renderBottomToolbarCustomActions: () => (
      <Text>
        Fetched {totalFetched} of {totalDBRows} total rows.
      </Text>
    ),
    enablePagination: false,
    enableRowNumbers: true,
    enableRowVirtualization: true, //optional, docs recommends to turn on if rows are going to be > 100
    rowVirtualizerInstanceRef,
    rowVirtualizerProps: { overscan: 10 },
    state: {
      sorting,
      isLoading,
      showProgressBars: isFetching,
      showAlertBanner: isError,
    },
    onSortingChange: setSorting,
    layoutMode: "semantic",
  });

  useEffect(() => {
    try {
      //scroll to top when column sorting changes
      rowVirtualizerInstanceRef.current?.scrollToIndex(0);
    } catch (e) {
      // console.log(e);
    }
  }, [sorting]);

  return <MantineReactTable table={table} />;
}
