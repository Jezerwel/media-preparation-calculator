import { describe, expect, it } from "vitest";

import { BATCH_RECORD_ROWS } from "./batch-record-fields";

describe("batch record fields", () => {
  it("keeps the requested batch record rows in form order", () => {
    expect(BATCH_RECORD_ROWS.map((row) => row.label)).toEqual([
      "Media Name",
      "Lot Number",
      "Media Expiration Date",
      "Actual Weight",
      "Actual pH",
      "Bottle Number",
      "Batch Number",
      "Batch Expiration Date",
      "Prepared By",
      "Checked By",
    ]);
  });

  it("marks only user-entered batch record rows as inputs", () => {
    const inputRows = BATCH_RECORD_ROWS.filter((row) => row.kind === "input");

    expect(inputRows.map((row) => row.key)).toEqual([
      "lotNumber",
      "mediaExpirationDate",
      "actualWeight",
      "actualPh",
      "bottleNumber",
      "preparedBy",
      "checkedBy",
    ]);
  });
});
