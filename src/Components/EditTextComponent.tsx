import { TextInput, TextInputProps } from "@mantine/core";
import { MRT_Cell, MRT_Column, MRT_TableInstance } from "mantine-react-table";
import { ChangeEvent, FocusEvent, KeyboardEvent, useState } from "react";

type Props<TData extends Record<string, unknown>> = {
  cell: MRT_Cell<TData>;
  column: MRT_Column<TData>;
  table: MRT_TableInstance<TData>;
  validate?: (value: string) => string | undefined;
  onSave?: (value: string, cell: MRT_Cell<TData>) => void;
} & TextInputProps;

export const EditTextComponent = <T extends Record<string, unknown>>({
  cell,
  column,
  table,
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
  const [value, setValue] = useState(() => cell.getValue<string>());
  const [error, setError] = useState("");

  const { creatingRow, editingRow } = getState();

  const isCreating = creatingRow?.id === row.id;
  const isEditing = editingRow?.id === row.id;

  // const arg = { cell, column, row, table };

  // const textInputProps = {
  //   ...parseFromValuesOrFunc(mantineEditTextInputProps, arg),
  // };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      editInputRefs.current[cell.id]?.blur();
    } else if (event.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const result = validate?.(e.currentTarget.value);
    if (result) {
      setError(result);
    } else {
      setError("");
    }
    setValue(e.currentTarget.value);
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
    if (event.currentTarget.value) {
      if (event.currentTarget.value !== cell.getValue()) {
        onSave?.(value, cell);
        saveInputValueToRowCache(value);
      }
    }
    setEditingCell(null);
  };
  return (
    <TextInput
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onChange={handleChange}
      value={value}
      ref={(node) => {
        if (node) {
          editInputRefs.current[cell.id] = node;
        }
      }}
      error={error}
      {...rest}
    />
  );
};
