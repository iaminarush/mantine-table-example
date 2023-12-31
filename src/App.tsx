import { Flex, Tabs } from "@mantine/core";
import { useState } from "react";
import CellEdit from "./screens/CellEdit";
import GroupEdit from "./screens/GroupEdit";
import MultiGrid from "./screens/MultiGrid";
import Columns from "./screens/Columns";
import InfiniteScroll from "./screens/InfiniteScroll";
import Virtualization from "./screens/Virtualization";

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

export default function App() {
  const [activeTab, setActiveTab] = useState<string | null>("virtualization");
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
          <Tabs.Tab value="infinite">Infinite Scroll</Tabs.Tab>
          <Tabs.Tab value="virtualization">Virtualization</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {activeTab === "cell" && <CellEdit />}
      {activeTab === "group" && <GroupEdit />}
      {activeTab === "multi" && <MultiGrid />}
      {activeTab === "columns" && <Columns />}
      {activeTab === "infinite" && <InfiniteScroll />}
      {activeTab === "virtualization" && <Virtualization />}
    </Flex>
  );
}
