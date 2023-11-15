import { NumberInput, NumberInputProps } from "@mantine/core";
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_TableInstance,
} from "mantine-react-table";
import { FocusEvent, KeyboardEvent, useState } from "react";

type Props<TData extends Record<string, unknown>> = {
  cell: MRT_Cell<TData>;
  column: MRT_Column<TData>;
  table: MRT_TableInstance<TData>;
  row: MRT_Row<TData>;
  validate?: (value: number | "") => string | undefined;
  onSave?: (value: number | "", cell: MRT_Cell<TData>) => void;
} & NumberInputProps;

export const EditNumberComponent = <T extends Record<string, unknown>>({
  cell,
  column,
  table,
  row,
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
  const [value, setValue] = useState<number | "">(() =>
    cell.getValue<number>()
  );
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

  const handleChange = (value: number | "") => {
    const result = validate?.(value);
    if (result) {
      setError(result);
    } else {
      setError("");
    }
    setValue(value);
  };

  const saveInputValueToRowCache = (newValue: number | "") => {
    const result = validate?.(value);
    console.log(!result);
    if (!result) {
      //@ts-ignore
      row._valuesCache[column.id] = newValue;
      if (isCreating) {
        setCreatingRow(row);
      } else if (isEditing) {
        setEditingRow(row);
      }
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value !== cell.getValue()) {
      onSave?.(value, cell);
      saveInputValueToRowCache(value);
    }
    setEditingCell(null);
  };

  return (
    <NumberInput
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
