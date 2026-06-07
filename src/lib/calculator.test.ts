import { describe, expect, it } from "vitest";

import { getMediaByCode, TEMP_PH_RANGE } from "./media-database";
import {
  calculateBatch,
  formatBatchNumber,
  formatRecordDate,
  getExpirationDate,
} from "./calculator";

describe("calculateBatch", () => {
  it("calculates exact raw and powder volume when rounding is disabled", () => {
    const result = calculateBatch({
      media: getMediaByCode("SDA"),
      containerCount: 27,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.rawVolumeMl).toBe(21600);
    expect(result.finalVolumeMl).toBe(21600);
    expect(result.overageMl).toBe(0);
    expect(result.powderGrams).toBe(1404);
    expect(result.waterRequirements).toEqual([
      { label: "Ultrapure Water", volumeMl: 21600 },
    ]);
  });

  it("rounds final volume up to the nearest 100 mL and calculates overage", () => {
    const result = calculateBatch({
      media: getMediaByCode("PBS-RM"),
      containerCount: 25,
      roundToNearestHundred: true,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.rawVolumeMl).toBe(2250);
    expect(result.finalVolumeMl).toBe(2300);
    expect(result.overageMl).toBe(50);
  });

  it("splits WFI and Ultrapure Water from final volume after rounding", () => {
    const result = calculateBatch({
      media: getMediaByCode("TSA"),
      containerCount: 27,
      roundToNearestHundred: true,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.waterRequirements).toEqual([
      { label: "WFI", volumeMl: 10800 },
      { label: "Ultrapure Water", volumeMl: 10800 },
    ]);
  });

  it("uses R2A fixed concentration of 18.2 g/L", () => {
    const result = calculateBatch({
      media: getMediaByCode("R2A"),
      containerCount: 1,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.powderGrams).toBe(14.56);
  });

  it("uses LB double-strength concentration of 26 g/L", () => {
    const result = calculateBatch({
      media: getMediaByCode("LB"),
      containerCount: 10,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.finalVolumeMl).toBe(90);
    expect(result.powderGrams).toBe(2.34);
    expect(result.warnings).toContain(
      "Final volume is under 100 mL. Confirm this small batch before preparing media.",
    );
  });

  it("calculates PBS additives without dehydrated media powder", () => {
    const result = calculateBatch({
      media: getMediaByCode("PBS-RM"),
      containerCount: 25,
      roundToNearestHundred: true,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.powderGrams).toBeNull();
    expect(result.additives).toEqual([
      { name: "PBS Stock Buffer", volumeMl: 2.875 },
      { name: "Polysorbate", volumeMl: 1.15 },
    ]);
  });

  it("flags invalid zero container count", () => {
    const result = calculateBatch({
      media: getMediaByCode("TSA"),
      containerCount: 0,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.isValid).toBe(false);
    expect(result.warnings).toContain(
      "Enter a container count greater than zero before preparing the batch sheet.",
    );
  });

  it("keeps temporary pH labels visible for pH-verified media", () => {
    const result = calculateBatch({
      media: getMediaByCode("TSA"),
      containerCount: 1,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.phRange).toBe(TEMP_PH_RANGE);
    expect(result.warnings).toContain(
      "pH range is temporary. Verify the approved range before laboratory use.",
    );
  });
});

describe("date formatting", () => {
  it("formats expiration date as 14 calendar days after preparation date", () => {
    const preparationDate = new Date(2026, 5, 4);

    expect(formatRecordDate(getExpirationDate(preparationDate))).toBe(
      "18 JUN 2026",
    );
  });

  it("formats batch number as media code and MMDDYY", () => {
    expect(formatBatchNumber("SDA", new Date(2026, 5, 4))).toBe("SDA - 060426");
  });
});
