import { Flex, Tabs } from "@mantine/core";
import { useState } from "react";
import CellEdit from "./screens/CellEdit";
import GroupEdit from "./screens/GroupEdit";
import MultiGrid from "./screens/MultiGrid";
import Columns from "./screens/Columns";

export type Book = {
  author: string;
  description: string;
  genre: string;
  id: number;
  image: string;
  isbn: string;
  published: string;
  publisher: string;
  title: string;
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getBooks = async () => {
  const response: Promise<{ data: Book[] }> = (
    await fetch("https://fakerapi.it/api/v1/books?_quantity=3")
  ).json();
  return (await response).data;
};

const patchBooks = async (value: Book) => {
  return sleep(1000).then(() => {
    return value;
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string | null>("columns");
  return (
    <Flex
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        minHeight: "100vh",
        padding: "1.5rem",
      }}
    >
      <Tabs value={activeTab} onTabChange={setActiveTab} keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="cell">Cell</Tabs.Tab>
          <Tabs.Tab value="group">Group</Tabs.Tab>
          <Tabs.Tab value="multi">Multi</Tabs.Tab>
          <Tabs.Tab value="columns">Columns</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {activeTab === "cell" && <CellEdit />}
      {activeTab === "group" && <GroupEdit />}
      {activeTab === "multi" && <MultiGrid />}
      {activeTab === "columns" && <Columns />}
    </Flex>
  );
}
