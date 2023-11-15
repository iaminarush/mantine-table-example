import { Box, Paper, Stack } from "@mantine/core";
import { ReactNode } from "react";

export default function GridContainer({ children }: { children: ReactNode }) {
  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // boxShadow: 3,
        borderRadius: "10px",
      }}
    >
      <Stack h="100%" w="100%" spacing={0}>
        <Box sx={{ height: "100%", width: "100%" }}>{children}</Box>
      </Stack>
    </Paper>
  );
}
