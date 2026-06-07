import { describe, expect, it } from "vitest";

import {
  getMediaByCode,
  MEDIA_DATABASE,
} from "./media-database";
import {
  calculateBatch,
  formatBatchNumber,
  formatRecordDate,
  generateInstructionText,
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

  it("rounds final volume up to the nearest 1000 mL when requested", () => {
    const result = calculateBatch({
      media: getMediaByCode("PBS-RM"),
      containerCount: 25,
      roundToNearestHundred: false,
      roundToNearestThousand: true,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.rawVolumeMl).toBe(2250);
    expect(result.finalVolumeMl).toBe(3000);
    expect(result.overageMl).toBe(750);
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

  it("includes pH verification steps for additive-only PBS media", () => {
    const result = calculateBatch({
      media: getMediaByCode("PBS-BIOBURDEN"),
      containerCount: 10,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(generateInstructionText(result)).toContain(
      "Verify pH is within 7.4-7.49.",
    );
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

  it("keeps approved pH ranges visible for pH-verified media", () => {
    const result = calculateBatch({
      media: getMediaByCode("TSA"),
      containerCount: 1,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.phRange).toBe("7.10-7.50");
    expect(result.warnings).not.toContain(
      "pH range is temporary. Verify the approved range before laboratory use.",
    );
  });
});

describe("media database", () => {
  it("keeps media options alphabetical by display name so selection is scannable", () => {
    const mediaNames = MEDIA_DATABASE.map((media) => media.name);

    expect(mediaNames).toEqual(
      [...mediaNames].sort((a, b) => a.localeCompare(b)),
    );
  });

  it("uses the approved media calculations and pH ranges", () => {
    expect(getMediaByCode("TSP")).toMatchObject({
      gramsPerLiter: 45.7,
      phRange: "7.10-7.50",
    });
    expect(getMediaByCode("TSA")).toMatchObject({
      fillVolumeMl: 800,
      gramsPerLiter: 40,
      phRange: "7.10-7.50",
    });
    expect(getMediaByCode("SDA")).toMatchObject({
      fillVolumeMl: 800,
      gramsPerLiter: 65,
      phRange: "5.40-5.80",
    });
    expect(getMediaByCode("PBS-BIOBURDEN")).toMatchObject({
      fillVolumeMl: 100,
      phRange: "7.4-7.49",
    });
    expect(getMediaByCode("PBS-RM")).toMatchObject({
      fillVolumeMl: 90,
      phRange: "7.4-7.49",
    });
    expect(getMediaByCode("LB")).toMatchObject({
      fillVolumeMl: 9,
      gramsPerLiter: 26,
      phRange: "6.7-7.10",
    });
    expect(getMediaByCode("R2A")).toMatchObject({
      fillVolumeMl: 800,
      gramsPerLiter: 18.2,
      phRange: "7.10-7.40",
    });
    expect(getMediaByCode("MLA")).toMatchObject({
      fillVolumeMl: 800,
      gramsPerLiter: 52.1,
      phRange: null,
    });
    expect(getMediaByCode("MLA").additives).toEqual([
      { name: "Polysorbate", mlPerLiter: 7 },
    ]);
    expect(getMediaByCode("MLB")).toMatchObject({
      fillVolumeMl: 90,
      gramsPerLiter: 37.8,
      phRange: null,
    });
    expect(getMediaByCode("MLB").additives).toEqual([
      { name: "Polysorbate", mlPerLiter: 5 },
    ]);
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
