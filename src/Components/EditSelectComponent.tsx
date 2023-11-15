import { Loader, Select, SelectItem, SelectProps } from "@mantine/core";
import { MRT_Cell, MRT_Column, MRT_TableInstance } from "mantine-react-table";
import { FocusEvent, KeyboardEvent, useState } from "react";

type Props<TData extends Record<string, unknown>> = {
  cell: MRT_Cell<TData>;
  column: MRT_Column<TData>;
  table: MRT_TableInstance<TData>;
  data: (string | SelectItem)[] | undefined;
  validate?: (value: string | null) => string | undefined;
  onSave?: (value: string | null, cell: MRT_Cell<TData>) => void;
} & Omit<SelectProps, "data">;

export const EditSelectComponent = <T extends Record<string, unknown>>({
  cell,
  column,
  table,
  data,
  validate,
  onSave,
  ...rest
}: Props<T>) => {
  const {
    getState,
    refs: { editInputRefs },
    setEditingCell,
    setEditingRow,
    setCreatingRow,
  } = table;
  const { row } = cell;
  const [value, setValue] = useState<string | null>(() =>
    cell.getValue<string>()
  );
  const [error, setError] = useState("");

  const { creatingRow, editingRow } = getState();

  const isCreating = creatingRow?.id === row.id;
  const isEditing = editingRow?.id === row.id;

  // const arg = { cell, column, row, table };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      editInputRefs.current[cell.id]?.blur();
    } else if (event.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleChange = (value: string | null) => {
    const result = validate?.(value);
    if (result) {
      setError(result);
    } else {
      setError("");
    }
    setValue(value);
  };

  const saveInputValueToRowCache = (newValue: string | null) => {
    //@ts-ignore
    row._valuesCache[column.id] = newValue;
    if (isCreating) {
      setCreatingRow(row);
    } else if (isEditing) {
      setEditingRow(row);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    console.log(event.currentTarget.value, cell.getValue());
    if (event.currentTarget.value !== cell.getValue()) {
      onSave?.(value, cell);
      saveInputValueToRowCache(value);
    }
    setEditingCell(null);
  };

  return (
    <>
      <Select
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        data={data || []}
        value={value}
        ref={(node) => {
          if (node) {
            editInputRefs.current[cell.id] = node;
          }
        }}
        error={error}
        rightSection={!data ? <Loader size={16} /> : null}
        {...rest}
      />
    </>
  );
};
