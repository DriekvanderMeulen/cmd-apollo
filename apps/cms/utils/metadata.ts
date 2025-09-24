import { ST } from "next/dist/shared/lib/utils";

type MetadataTypes = "STRING" | "BOOLEAN" | "INT" | "FLOAT" | "DATETIME" | "SINGLE_SELECT";

type MetadataOptions = {
  value: MetadataTypes;
  label: string;
}[];

export const metadataOptions: MetadataOptions = [
  // { value: "STRING", label: "String" },
  // { value: "BOOLEAN", label: "Boolean" },
  // { value: "INT", label: "Integer" },
  // { value: "FLOAT", label: "Float" },
  // { value: "DATETIME", label: "Datetime" },
  { value: "SINGLE_SELECT", label: "Single select" },
];

interface MetadataValues {
  valueString: string | null;
  valueBoolean: boolean | null;
  valueInt: number | null;
  valueFloat: number | null;
  valueDatetime: Date | null;
}

export function resolveMetadataValue(
  type: MetadataTypes,
  values: MetadataValues,
) {
  switch (type) {
    case "STRING":
      return values.valueString;
    case "SINGLE_SELECT":
      return values.valueString;
    case "BOOLEAN":
      return values.valueBoolean;
    case "INT":
      return values.valueInt;
    case "FLOAT":
      return values.valueFloat;
    case "DATETIME":
      return values.valueDatetime;
    default:
      return null;
  }
}
