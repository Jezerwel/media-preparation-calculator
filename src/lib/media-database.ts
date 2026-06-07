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
