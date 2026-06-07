export const BATCH_RECORD_ROWS = [
  { kind: "automatic", label: "Media Name", valueKey: "mediaName" },
  { kind: "input", label: "Lot Number", key: "lotNumber", inputType: "text" },
  {
    kind: "input",
    label: "Media Expiration Date",
    key: "mediaExpirationDate",
    inputType: "date",
  },
  {
    kind: "input",
    label: "Actual Weight",
    key: "actualWeight",
    inputType: "text",
  },
  { kind: "input", label: "Actual pH", key: "actualPh", inputType: "text" },
  {
    kind: "input",
    label: "Bottle Number",
    key: "bottleNumber",
    inputType: "text",
  },
  { kind: "automatic", label: "Batch Number", valueKey: "batchNumber" },
  {
    kind: "automatic",
    label: "Batch Expiration Date",
    valueKey: "batchExpirationDate",
  },
  { kind: "input", label: "Prepared By", key: "preparedBy", inputType: "text" },
  { kind: "input", label: "Checked By", key: "checkedBy", inputType: "text" },
] as const;

export type BatchRecordInputKey = Extract<
  (typeof BATCH_RECORD_ROWS)[number],
  { kind: "input" }
>["key"];

export type BatchRecordInputType = Extract<
  (typeof BATCH_RECORD_ROWS)[number],
  { kind: "input" }
>["inputType"];

export type BatchRecordAutomaticValueKey = Extract<
  (typeof BATCH_RECORD_ROWS)[number],
  { kind: "automatic" }
>["valueKey"];
