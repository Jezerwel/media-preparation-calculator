import {
  type Additive,
  type MediaEntry,
  TEMP_PH_RANGE,
} from "./media-database";

export type BatchInput = {
  media: MediaEntry;
  containerCount: number;
  roundToNearestHundred: boolean;
  roundToNearestThousand?: boolean;
  preparationDate: Date;
};

export type VolumeLine = {
  label: string;
  volumeMl: number;
};

export type CalculatedAdditive = {
  name: Additive["name"];
  volumeMl: number;
};

export type BatchCalculation = {
  media: MediaEntry;
  containerCount: number;
  rawVolumeMl: number;
  finalVolumeMl: number;
  overageMl: number;
  powderGrams: number | null;
  additives: CalculatedAdditive[];
  waterRequirements: VolumeLine[];
  preparationDate: Date;
  expirationDate: Date;
  batchNumber: string;
  phRange: string | null;
  warnings: string[];
  isValid: boolean;
};

export function calculateBatch(input: BatchInput): BatchCalculation {
  const rawVolumeMl = input.containerCount * input.media.fillVolumeMl;
  const finalVolumeMl = getRoundedFinalVolume(rawVolumeMl, input);
  const warnings = getWarnings(
    input.media,
    input.containerCount,
    finalVolumeMl,
  );

  return {
    media: input.media,
    containerCount: input.containerCount,
    rawVolumeMl,
    finalVolumeMl,
    overageMl: finalVolumeMl - rawVolumeMl,
    powderGrams:
      input.media.gramsPerLiter === null
        ? null
        : roundPowderGrams(finalVolumeMl, input.media.gramsPerLiter),
    additives: input.media.additives.map((additive) => ({
      name: additive.name,
      volumeMl: (finalVolumeMl * additive.mlPerLiter) / 1000,
    })),
    waterRequirements: getWaterRequirements(input.media, finalVolumeMl),
    preparationDate: input.preparationDate,
    expirationDate: getExpirationDate(input.preparationDate),
    batchNumber: formatBatchNumber(input.media.code, input.preparationDate),
    phRange: input.media.phRange,
    warnings,
    isValid: input.containerCount > 0,
  };
}

export function roundUpToNearestHundred(value: number): number {
  return Math.ceil(value / 100) * 100;
}

export function roundUpToNearestThousand(value: number): number {
  return Math.ceil(value / 1000) * 1000;
}

function getRoundedFinalVolume(value: number, input: BatchInput): number {
  if (input.roundToNearestThousand) return roundUpToNearestThousand(value);
  if (input.roundToNearestHundred) return roundUpToNearestHundred(value);
  return value;
}

export function roundPowderGrams(
  finalVolumeMl: number,
  gramsPerLiter: number,
): number {
  return roundTo((finalVolumeMl * gramsPerLiter) / 1000, 2);
}

export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function getWaterRequirements(
  media: MediaEntry,
  finalVolumeMl: number,
): VolumeLine[] {
  if (media.water.kind === "split-wfi-ultrapure") {
    return [
      { label: "WFI", volumeMl: finalVolumeMl / 2 },
      { label: "Ultrapure Water", volumeMl: finalVolumeMl / 2 },
    ];
  }

  return [{ label: "Ultrapure Water", volumeMl: finalVolumeMl }];
}

export function getExpirationDate(preparationDate: Date): Date {
  const expiration = new Date(preparationDate);
  expiration.setDate(expiration.getDate() + 14);
  return expiration;
}

export function formatRecordDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
}

export function formatBatchNumber(
  mediaCode: string,
  preparationDate: Date,
): string {
  const month = String(preparationDate.getMonth() + 1).padStart(2, "0");
  const day = String(preparationDate.getDate()).padStart(2, "0");
  const year = String(preparationDate.getFullYear()).slice(-2);

  return `${mediaCode} - ${month}${day}${year}`;
}

export function formatVolume(volumeMl: number): string {
  return `${Number.isInteger(volumeMl) ? volumeMl.toFixed(0) : volumeMl.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} mL`;
}

export function formatGrams(grams: number): string {
  return `${grams.toFixed(2)} g`;
}

export function generateInstructionText(calculation: BatchCalculation): string {
  const lines = [
    `You are going to make ${calculation.containerCount} ${pluralize(calculation.media.containerType, calculation.containerCount)} of ${calculation.media.name}.`,
    `Prepare ${formatVolume(calculation.finalVolumeMl)} total volume.`,
  ];

  if (calculation.powderGrams === null) {
    lines.push("No dehydrated media powder is required.");
  } else {
    lines.push(
      `Weigh ${formatGrams(calculation.powderGrams)} ${
        calculation.media.powderLabel ?? calculation.media.code
      }.`,
    );
  }

  calculation.additives.forEach((additive) => {
    lines.push(`Add ${formatVolume(additive.volumeMl)} ${additive.name}.`);
  });

  lines.push("");

  const steps =
    calculation.powderGrams === null
      ? getAdditiveOnlySteps(calculation)
      : getPowderMediaSteps(calculation);

  steps.forEach((step, index) => {
    lines.push(`${index + 1}. ${step}`);
  });

  return lines.join("\n");
}

export function pluralize(containerType: string, count: number): string {
  if (count === 1) return containerType;
  if (containerType === "Test Tube") return "Test Tubes";
  return `${containerType}s`;
}

function getWarnings(
  media: MediaEntry,
  containerCount: number,
  finalVolumeMl: number,
): string[] {
  const warnings: string[] = [];

  if (containerCount <= 0) {
    warnings.push(
      "Enter a container count greater than zero before preparing the batch sheet.",
    );
  }

  if (containerCount > 0 && finalVolumeMl < 100) {
    warnings.push(
      "Final volume is under 100 mL. Confirm this small batch before preparing media.",
    );
  }

  if (media.phRange === TEMP_PH_RANGE) {
    warnings.push(
      "pH range is temporary. Verify the approved range before laboratory use.",
    );
  }

  return warnings;
}

function getPowderMediaSteps(calculation: BatchCalculation): string[] {
  const steps = [
    "Weigh the required dehydrated media powder.",
    "Add the first water portion.",
    "Mix until fully dissolved.",
    "Add remaining water and bring to final volume.",
  ];

  if (calculation.media.requiresPhVerification) {
    steps.push(
      `Verify pH is within ${calculation.phRange ?? "specification"}.`,
    );
    steps.push("If pH is low, adjust with NaOH.");
    steps.push("If pH is high, adjust with HCl.");
  }

  if (calculation.media.requiresAutoclaving) {
    steps.push("Autoclave according to SOP.");
  }

  steps.push("Before dispensing, swirl the container at least 5 times.");
  steps.push("Dispense into containers.");
  steps.push("Inspect for clarity and proper fill volume.");
  steps.push("Complete the preparation log.");

  return steps;
}

function getAdditiveOnlySteps(calculation: BatchCalculation): string[] {
  const steps = [
    "Measure the required Ultrapure Water.",
    "Add required PBS Stock Buffer.",
  ];

  if (
    calculation.additives.some((additive) => additive.name === "Polysorbate")
  ) {
    steps.push("Add required Polysorbate.");
  }

  steps.push("Mix until fully uniform.");
  steps.push("Bring to final volume if needed.");

  if (calculation.media.requiresPhVerification) {
    steps.push(
      `Verify pH is within ${calculation.phRange ?? "specification"}.`,
    );
    steps.push("If pH is low, adjust with NaOH.");
    steps.push("If pH is high, adjust with HCl.");
  }

  steps.push("Before dispensing, swirl the container at least 5 times.");
  steps.push("Dispense into containers.");
  steps.push("Inspect for clarity and proper fill volume.");
  steps.push("Complete the preparation log.");

  return steps;
}
