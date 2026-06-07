# Media Preparation Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved single-page laboratory Media Preparation Calculator with fixed media rules, calculation summary, editable batch sheet fields, copy instructions, and print-friendly output.

**Architecture:** Keep media facts and calculation rules in pure TypeScript modules, then render them through one client component on the existing Next.js route. The page remains single-route and client-side because there is no persistence, account system, or server workflow.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Vitest for pure calculation tests.

---

## Preconditions

- Current project root: `C:\Users\Acer\Desktop\media-preparation-calculator`
- The folder is not currently a git repository. Commit steps are conditional: run them only if git has been initialized before execution.
- Approved design spec: `docs/superpowers/specs/2026-06-07-media-preparation-calculator-design.md`
- Domain glossary: `CONTEXT.md`

## File Structure

- Modify: `package.json` - add a unit test script after installing Vitest.
- Create: `src/lib/media-database.ts` - fixed media database, domain types, constants.
- Create: `src/lib/calculator.ts` - pure calculation, formatting, warning, and instruction-generation helpers.
- Create: `src/lib/calculator.test.ts` - unit tests for calculation intent.
- Create: `src/app/_components/MediaPreparationCalculator.tsx` - interactive client component.
- Modify: `src/app/page.tsx` - render calculator instead of T3 scaffold.
- Modify: `src/app/layout.tsx` - product metadata.
- Modify: `src/styles/globals.css` - design tokens, print CSS, base page styling.

## Success Criteria

- User can select a fixed media and enter a container count.
- Optional round-up to nearest 100 mL works and displays raw volume, final volume, and overage.
- Powder and additive quantities use final volume.
- PBS Bioburden and PBS RM show no dehydrated media powder.
- R2A calculates at `18.2 g/L`.
- LB is labeled double-strength and calculates at `26 g/L`.
- Preparation date defaults to today and is editable.
- Expiration date is preparation date + 14 days, formatted like `18 JUN 2026`.
- Batch number format is `MEDIA - MMDDYY`, for example `SDA - 060426`.
- Batch record fields are editable and print as values or blank lines.
- Copy Instructions copies generated plain text.
- Print Batch Sheet opens print flow and print CSS hides app controls.
- Warnings appear for blank/zero count and final volume under 100 mL.
- `pnpm test`, `pnpm typecheck`, and `pnpm lint` pass.

---

### Task 1: Add Calculation Test Harness

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Vitest**

Run:

```powershell
pnpm add -D vitest
```

Expected: `package.json` and `pnpm-lock.yaml` update with `vitest`.

- [ ] **Step 2: Add test script**

Modify `package.json` scripts so this entry exists:

```json
"test": "vitest run"
```

Expected scripts include:

```json
{
  "build": "next build",
  "check": "next lint && tsc --noEmit",
  "dev": "next dev --turbo",
  "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
  "format:write": "prettier --write \"**/*.{ts,tsx,js,jsx,mdx}\" --cache",
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "preview": "next build && next start",
  "start": "next start",
  "test": "vitest run",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 3: Run empty test command**

Run:

```powershell
pnpm test
```

Expected: Vitest exits with no test files found. This confirms the runner is installed before calculation tests are added.

- [ ] **Step 4: Conditional commit**

If this folder has git initialized:

```powershell
git add package.json pnpm-lock.yaml
git commit -m "test: add calculation test runner"
```

---

### Task 2: Define the Fixed Media Database

**Files:**
- Create: `src/lib/media-database.ts`

- [ ] **Step 1: Create domain types and media data**

Create `src/lib/media-database.ts`:

```ts
export type ContainerType = "Bottle" | "Flask" | "Test Tube";

export type WaterRequirement =
  | { kind: "ultrapure-only" }
  | { kind: "split-wfi-ultrapure" };

export type Additive = {
  name: "PBS Stock Buffer" | "Polysorbate";
  mlPerLiter: number;
};

export type MediaEntry = {
  code: string;
  name: string;
  containerType: ContainerType;
  fillVolumeMl: number;
  water: WaterRequirement;
  gramsPerLiter: number | null;
  powderLabel: string | null;
  additives: Additive[];
  requiresPhVerification: boolean;
  phRange: string | null;
  requiresAutoclaving: boolean;
  notes: string[];
};

export const TEMP_PH_RANGE = "TEMP RANGE - VERIFY BEFORE USE";

export const MEDIA_DATABASE = [
  {
    code: "TSA",
    name: "TSA",
    containerType: "Bottle",
    fillVolumeMl: 800,
    water: { kind: "split-wfi-ultrapure" },
    gramsPerLiter: 40,
    powderLabel: "TSA",
    additives: [],
    requiresPhVerification: true,
    phRange: TEMP_PH_RANGE,
    requiresAutoclaving: true,
    notes: ["Requires pH verification", "Requires autoclaving"],
  },
  {
    code: "SDA",
    name: "SDA",
    containerType: "Bottle",
    fillVolumeMl: 800,
    water: { kind: "ultrapure-only" },
    gramsPerLiter: 65,
    powderLabel: "SDA",
    additives: [],
    requiresPhVerification: true,
    phRange: TEMP_PH_RANGE,
    requiresAutoclaving: true,
    notes: ["Requires pH verification", "Requires autoclaving"],
  },
  {
    code: "MLA",
    name: "MLA",
    containerType: "Bottle",
    fillVolumeMl: 800,
    water: { kind: "ultrapure-only" },
    gramsPerLiter: 72.1,
    powderLabel: "MLA",
    additives: [],
    requiresPhVerification: false,
    phRange: null,
    requiresAutoclaving: true,
    notes: ["Requires autoclaving"],
  },
  {
    code: "R2A",
    name: "R2A",
    containerType: "Bottle",
    fillVolumeMl: 800,
    water: { kind: "ultrapure-only" },
    gramsPerLiter: 18.2,
    powderLabel: "R2A",
    additives: [],
    requiresPhVerification: false,
    phRange: null,
    requiresAutoclaving: true,
    notes: ["Requires autoclaving"],
  },
  {
    code: "TSP",
    name: "TSP",
    containerType: "Flask",
    fillVolumeMl: 400,
    water: { kind: "split-wfi-ultrapure" },
    gramsPerLiter: 45.7,
    powderLabel: "TSP",
    additives: [],
    requiresPhVerification: true,
    phRange: TEMP_PH_RANGE,
    requiresAutoclaving: true,
    notes: ["Requires pH verification", "Requires autoclaving"],
  },
  {
    code: "PBS-BIOBURDEN",
    name: "PBS Bioburden",
    containerType: "Bottle",
    fillVolumeMl: 100,
    water: { kind: "ultrapure-only" },
    gramsPerLiter: null,
    powderLabel: null,
    additives: [{ name: "PBS Stock Buffer", mlPerLiter: 1.25 }],
    requiresPhVerification: false,
    phRange: null,
    requiresAutoclaving: false,
    notes: ["No dehydrated media calculation"],
  },
  {
    code: "PBS-RM",
    name: "PBS RM",
    containerType: "Bottle",
    fillVolumeMl: 90,
    water: { kind: "ultrapure-only" },
    gramsPerLiter: null,
    powderLabel: null,
    additives: [
      { name: "PBS Stock Buffer", mlPerLiter: 1.25 },
      { name: "Polysorbate", mlPerLiter: 0.5 },
    ],
    requiresPhVerification: false,
    phRange: null,
    requiresAutoclaving: false,
    notes: ["No dehydrated media calculation"],
  },
  {
    code: "LB",
    name: "LB",
    containerType: "Test Tube",
    fillVolumeMl: 9,
    water: { kind: "ultrapure-only" },
    gramsPerLiter: 26,
    powderLabel: "LB double-strength (13 g/L x 2)",
    additives: [],
    requiresPhVerification: false,
    phRange: null,
    requiresAutoclaving: true,
    notes: ["Double-strength from 13 g/L basis", "Requires autoclaving"],
  },
  {
    code: "MLB",
    name: "MLB",
    containerType: "Bottle",
    fillVolumeMl: 90,
    water: { kind: "ultrapure-only" },
    gramsPerLiter: 37.8,
    powderLabel: "MLB",
    additives: [{ name: "Polysorbate", mlPerLiter: 5 }],
    requiresPhVerification: false,
    phRange: null,
    requiresAutoclaving: true,
    notes: ["Requires autoclaving"],
  },
] as const satisfies readonly MediaEntry[];

export type MediaCode = (typeof MEDIA_DATABASE)[number]["code"];

export function getMediaByCode(code: string): MediaEntry {
  const media = MEDIA_DATABASE.find((entry) => entry.code === code);

  if (!media) {
    throw new Error(`Unknown media code: ${code}`);
  }

  return media;
}
```

- [ ] **Step 2: Verify types**

Run:

```powershell
pnpm typecheck
```

Expected: pass.

- [ ] **Step 3: Conditional commit**

If git is initialized:

```powershell
git add src/lib/media-database.ts
git commit -m "feat: define fixed media database"
```

---

### Task 3: Write Calculation Tests First

**Files:**
- Create: `src/lib/calculator.test.ts`

- [ ] **Step 1: Add failing tests for calculation intent**

Create `src/lib/calculator.test.ts`:

```ts
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
    expect(result.warnings).toContain("Final volume is under 100 mL. Confirm this small batch before preparing media.");
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
    expect(result.warnings).toContain("Enter a container count greater than zero before preparing the batch sheet.");
  });

  it("keeps temporary pH labels visible for pH-verified media", () => {
    const result = calculateBatch({
      media: getMediaByCode("TSA"),
      containerCount: 1,
      roundToNearestHundred: false,
      preparationDate: new Date(2026, 5, 4),
    });

    expect(result.phRange).toBe(TEMP_PH_RANGE);
    expect(result.warnings).toContain("pH range is temporary. Verify the approved range before laboratory use.");
  });
});

describe("date formatting", () => {
  it("formats expiration date as 14 calendar days after preparation date", () => {
    const preparationDate = new Date(2026, 5, 4);

    expect(formatRecordDate(getExpirationDate(preparationDate))).toBe("18 JUN 2026");
  });

  it("formats batch number as media code and MMDDYY", () => {
    expect(formatBatchNumber("SDA", new Date(2026, 5, 4))).toBe("SDA - 060426");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
pnpm test
```

Expected: fail because `src/lib/calculator.ts` does not exist yet.

---

### Task 4: Implement Pure Calculation Helpers

**Files:**
- Create: `src/lib/calculator.ts`

- [ ] **Step 1: Create calculation helper module**

Create `src/lib/calculator.ts`:

```ts
import { type Additive, type MediaEntry, TEMP_PH_RANGE } from "./media-database";

export type BatchInput = {
  media: MediaEntry;
  containerCount: number;
  roundToNearestHundred: boolean;
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
  const finalVolumeMl = input.roundToNearestHundred
    ? roundUpToNearestHundred(rawVolumeMl)
    : rawVolumeMl;
  const warnings = getWarnings(input.media, input.containerCount, finalVolumeMl);

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

export function roundPowderGrams(finalVolumeMl: number, gramsPerLiter: number): number {
  return roundTo((finalVolumeMl * gramsPerLiter) / 1000, 2);
}

export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function getWaterRequirements(media: MediaEntry, finalVolumeMl: number): VolumeLine[] {
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
  return new Date(year, month - 1, day);
}

export function formatBatchNumber(mediaCode: string, preparationDate: Date): string {
  const month = String(preparationDate.getMonth() + 1).padStart(2, "0");
  const day = String(preparationDate.getDate()).padStart(2, "0");
  const year = String(preparationDate.getFullYear()).slice(-2);

  return `${mediaCode} - ${month}${day}${year}`;
}

export function formatVolume(volumeMl: number): string {
  return `${Number.isInteger(volumeMl) ? volumeMl.toFixed(0) : volumeMl.toFixed(1)} mL`;
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
    lines.push(`Weigh ${formatGrams(calculation.powderGrams)} ${calculation.media.powderLabel ?? calculation.media.code}.`);
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

function getWarnings(media: MediaEntry, containerCount: number, finalVolumeMl: number): string[] {
  const warnings: string[] = [];

  if (containerCount <= 0) {
    warnings.push("Enter a container count greater than zero before preparing the batch sheet.");
  }

  if (containerCount > 0 && finalVolumeMl < 100) {
    warnings.push("Final volume is under 100 mL. Confirm this small batch before preparing media.");
  }

  if (media.phRange === TEMP_PH_RANGE) {
    warnings.push("pH range is temporary. Verify the approved range before laboratory use.");
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
    steps.push(`Verify pH is within ${calculation.phRange ?? "specification"}.`);
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

  if (calculation.additives.some((additive) => additive.name === "Polysorbate")) {
    steps.push("Add required Polysorbate.");
  }

  steps.push("Mix until fully uniform.");
  steps.push("Bring to final volume if needed.");
  steps.push("Before dispensing, swirl the container at least 5 times.");
  steps.push("Dispense into containers.");
  steps.push("Inspect for clarity and proper fill volume.");
  steps.push("Complete the preparation log.");

  return steps;
}
```

- [ ] **Step 2: Run tests**

Run:

```powershell
pnpm test
```

Expected: pass.

- [ ] **Step 3: Run typecheck**

Run:

```powershell
pnpm typecheck
```

Expected: pass.

- [ ] **Step 4: Conditional commit**

If git is initialized:

```powershell
git add src/lib/calculator.ts src/lib/calculator.test.ts
git commit -m "feat: add media preparation calculations"
```

---

### Task 5: Build the Interactive Calculator Component

**Files:**
- Create: `src/app/_components/MediaPreparationCalculator.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create client component**

Create `src/app/_components/MediaPreparationCalculator.tsx` with these responsibilities:

```tsx
"use client";

import { useMemo, useState } from "react";

import { MEDIA_DATABASE, getMediaByCode } from "~/lib/media-database";
import {
  calculateBatch,
  formatDateInputValue,
  formatGrams,
  formatRecordDate,
  formatVolume,
  generateInstructionText,
  parseDateInputValue,
  pluralize,
} from "~/lib/calculator";

type BatchRecordFields = {
  preparedBy: string;
  checkedBy: string;
  date: string;
  mediaLot: string;
  autoclaveCycle: string;
  initialPh: string;
  finalPh: string;
  comments: string;
};

const emptyRecordFields: BatchRecordFields = {
  preparedBy: "",
  checkedBy: "",
  date: "",
  mediaLot: "",
  autoclaveCycle: "",
  initialPh: "",
  finalPh: "",
  comments: "",
};

export function MediaPreparationCalculator() {
  const today = useMemo(() => new Date(), []);
  const [mediaCode, setMediaCode] = useState(MEDIA_DATABASE[0]?.code ?? "TSA");
  const [containerCountText, setContainerCountText] = useState("");
  const [roundToNearestHundred, setRoundToNearestHundred] = useState(false);
  const [preparationDateText, setPreparationDateText] = useState(formatDateInputValue(today));
  const [hasCalculated, setHasCalculated] = useState(false);
  const [recordFields, setRecordFields] = useState<BatchRecordFields>(emptyRecordFields);
  const [copyStatus, setCopyStatus] = useState("");

  const selectedMedia = getMediaByCode(mediaCode);
  const containerCount = Number(containerCountText);
  const preparationDate = parseDateInputValue(preparationDateText);
  const calculation = calculateBatch({
    media: selectedMedia,
    containerCount: Number.isFinite(containerCount) ? containerCount : 0,
    roundToNearestHundred,
    preparationDate,
  });
  const instructions = generateInstructionText(calculation);

  function updateRecordField(field: keyof BatchRecordFields, value: string) {
    setRecordFields((current) => ({ ...current, [field]: value }));
  }

  async function copyInstructions() {
    await navigator.clipboard.writeText(instructions);
    setCopyStatus("Instructions copied");
  }

  return (
    <main className="min-h-screen bg-[var(--bench-surface)] px-4 py-6 text-[var(--ink)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-2 print:hidden">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--teal)]">Laboratory calculator</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Media Preparation Calculator</h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Select a media, enter the container count, and generate preparation quantities with a printable batch sheet.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)]">
          <section className="space-y-5 print:hidden">
            <InputCard
              mediaCode={mediaCode}
              containerCountText={containerCountText}
              roundToNearestHundred={roundToNearestHundred}
              preparationDateText={preparationDateText}
              onMediaChange={setMediaCode}
              onContainerCountChange={setContainerCountText}
              onRoundChange={setRoundToNearestHundred}
              onPreparationDateChange={setPreparationDateText}
              onCalculate={() => setHasCalculated(true)}
            />
            <SummaryCard calculation={calculation} hasCalculated={hasCalculated} />
          </section>

          <BatchSheet
            calculation={calculation}
            hasCalculated={hasCalculated}
            instructions={instructions}
            recordFields={recordFields}
            copyStatus={copyStatus}
            onCopyInstructions={copyInstructions}
            onPrint={() => window.print()}
            onRecordFieldChange={updateRecordField}
          />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Complete the component subcomponents**

In the same file, add small local subcomponents:

```tsx
function InputCard(props: {
  mediaCode: string;
  containerCountText: string;
  roundToNearestHundred: boolean;
  preparationDateText: string;
  onMediaChange: (value: string) => void;
  onContainerCountChange: (value: string) => void;
  onRoundChange: (value: boolean) => void;
  onPreparationDateChange: (value: string) => void;
  onCalculate: () => void;
}) {
  const selectedMedia = getMediaByCode(props.mediaCode);

  return (
    <section className="lab-card">
      <h2 className="card-title">Input Section</h2>
      <div className="field-group">
        <label htmlFor="media">Media Type</label>
        <select id="media" value={props.mediaCode} onChange={(event) => props.onMediaChange(event.target.value)}>
          {MEDIA_DATABASE.map((media) => (
            <option key={media.code} value={media.code}>
              {media.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="container-count">Number of {pluralize(selectedMedia.containerType, 2)}</label>
        <input
          id="container-count"
          min="0"
          inputMode="numeric"
          type="number"
          value={props.containerCountText}
          onChange={(event) => props.onContainerCountChange(event.target.value)}
        />
      </div>
      <div className="field-group">
        <label htmlFor="preparation-date">Preparation Date</label>
        <input
          id="preparation-date"
          type="date"
          value={props.preparationDateText}
          onChange={(event) => props.onPreparationDateChange(event.target.value)}
        />
      </div>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={props.roundToNearestHundred}
          onChange={(event) => props.onRoundChange(event.target.checked)}
        />
        <span>Round final volume up to nearest 100 mL</span>
      </label>
      <button className="primary-button" type="button" onClick={props.onCalculate}>
        Calculate
      </button>
    </section>
  );
}
```

Add `SummaryCard`, `BatchSheet`, and small display helpers in the same component file. Keep them presentational; do not put calculation formulas in JSX.

- [ ] **Step 3: Render component from page**

Replace `src/app/page.tsx` with:

```tsx
import { MediaPreparationCalculator } from "./_components/MediaPreparationCalculator";

export default function HomePage() {
  return <MediaPreparationCalculator />;
}
```

- [ ] **Step 4: Run typecheck**

Run:

```powershell
pnpm typecheck
```

Expected: pass after all subcomponents are completed.

- [ ] **Step 5: Conditional commit**

If git is initialized:

```powershell
git add src/app/page.tsx src/app/_components/MediaPreparationCalculator.tsx
git commit -m "feat: build calculator interface"
```

---

### Task 6: Add Professional Lab Styling and Print CSS

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update metadata**

Modify `src/app/layout.tsx` metadata:

```ts
export const metadata: Metadata = {
  title: "Media Preparation Calculator",
  description: "Laboratory media preparation calculator and printable batch sheet.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};
```

- [ ] **Step 2: Add global design tokens and print rules**

Append to `src/styles/globals.css`:

```css
:root {
  --bench-surface: #eef3f1;
  --record-white: #ffffff;
  --ink: #17211f;
  --muted: #5d6b67;
  --rule: #c8d2ce;
  --teal: #0f766e;
  --teal-dark: #115e59;
  --warning: #9a5b00;
  --warning-bg: #fff7df;
}

body {
  margin: 0;
  background: var(--bench-surface);
}

.lab-card {
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--record-white);
  padding: 1rem;
}

.card-title {
  margin-bottom: 0.875rem;
  font-size: 1rem;
  font-weight: 700;
}

.field-group {
  display: grid;
  gap: 0.375rem;
  margin-bottom: 0.875rem;
}

.field-group label,
.checkbox-row {
  font-size: 0.875rem;
  font-weight: 600;
}

.field-group input,
.field-group select,
.field-group textarea {
  min-height: 2.5rem;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: #fff;
  padding: 0.55rem 0.7rem;
  color: var(--ink);
}

.field-group input:focus,
.field-group select:focus,
.field-group textarea:focus {
  outline: 2px solid color-mix(in srgb, var(--teal) 35%, transparent);
  border-color: var(--teal);
}

.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.primary-button,
.secondary-button {
  min-height: 2.5rem;
  border-radius: 6px;
  padding: 0.55rem 0.85rem;
  font-weight: 700;
}

.primary-button {
  background: var(--teal);
  color: white;
}

.primary-button:hover {
  background: var(--teal-dark);
}

.secondary-button {
  border: 1px solid var(--rule);
  background: white;
  color: var(--ink);
}

.warning-box {
  border: 1px solid #e7b85b;
  border-radius: 6px;
  background: var(--warning-bg);
  padding: 0.75rem;
  color: var(--warning);
  font-size: 0.875rem;
}

.record-line {
  min-height: 2rem;
  border-bottom: 1px solid var(--rule);
}

@media print {
  @page {
    margin: 0.5in;
  }

  body {
    background: white;
  }

  .print\\:hidden {
    display: none !important;
  }

  .lab-card {
    border: 0;
    padding: 0;
  }

  input,
  textarea,
  select,
  button {
    border: 0;
    background: transparent;
    box-shadow: none;
  }
}
```

- [ ] **Step 3: Run format**

Run:

```powershell
pnpm format:write
```

Expected: formatting completes.

- [ ] **Step 4: Run checks**

Run:

```powershell
pnpm lint
pnpm typecheck
pnpm test
```

Expected: all pass.

- [ ] **Step 5: Conditional commit**

If git is initialized:

```powershell
git add src/styles/globals.css src/app/layout.tsx
git commit -m "style: add laboratory calculator presentation"
```

---

### Task 7: Final Browser and Print Verification

**Files:**
- No new files expected unless defects are found.

- [ ] **Step 1: Start the app**

Run:

```powershell
pnpm dev
```

Expected: Next.js serves the app, usually at `http://localhost:3000`.

- [ ] **Step 2: Verify TSA rounded example**

In the browser:

1. Select `TSA`.
2. Enter `27`.
3. Check round-up.
4. Click Calculate.

Expected:

- Raw volume: `21600 mL`
- Final volume: `21600 mL`
- Overage: `0 mL`
- Powder: `864.00 g`
- Water: `10800 mL WFI`, `10800 mL Ultrapure Water`

- [ ] **Step 3: Verify PBS RM rounded example**

In the browser:

1. Select `PBS RM`.
2. Enter `25`.
3. Check round-up.
4. Click Calculate.

Expected:

- Raw volume: `2250 mL`
- Final volume: `2300 mL`
- Overage: `50 mL`
- Media powder: `Not applicable`
- PBS Stock Buffer: `2.875 mL`
- Polysorbate: `1.15 mL`

- [ ] **Step 4: Verify date outputs**

Set preparation date to `2026-06-04`.

Expected:

- Expiration date: `18 JUN 2026`
- Batch number for SDA: `SDA - 060426`

- [ ] **Step 5: Verify print behavior**

Click `Print Batch Sheet`.

Expected:

- Browser print dialog opens.
- Input controls and app buttons are hidden.
- Batch sheet remains readable.
- Empty batch record fields print as blank lines.

- [ ] **Step 6: Verify copy behavior**

Click `Copy Instructions`.

Expected:

- Clipboard contains generated quantities and numbered procedure text.
- UI displays a short copied confirmation.

- [ ] **Step 7: Final checks**

Stop the dev server, then run:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 8: Conditional final commit**

If git is initialized and any verification fixes were made:

```powershell
git add .
git commit -m "fix: polish media calculator verification issues"
```

---

## Plan Self-Review

- Spec coverage: fixed media database, rounding, calculations, additives, water split, dates, batch number, editable record fields, warnings, copy, print, responsive layout, and placeholder pH warning are covered.
- Placeholder scan: the only placeholder is the approved `TEMP RANGE - VERIFY BEFORE USE` domain value.
- Type consistency: media entries, calculation return shape, and UI state names align across tasks.
- Scope check: no persistence, accounts, API, or editable media database were added.
