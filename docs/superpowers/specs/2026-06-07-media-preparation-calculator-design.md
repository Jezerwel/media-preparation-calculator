# Media Preparation Calculator Design

## Goal

Build a professional single-page laboratory media preparation calculator that lets microbiology lab personnel select a media, enter a container count, calculate required volumes and reagents, and generate a printable SOP-style batch preparation sheet.

## Product Context

The app is a daily-use laboratory work surface, not a landing page or general dashboard. The user journey is:

1. Select a media.
2. Enter the number of containers for that media's container type.
3. Optionally round the final volume up to the nearest 100 mL.
4. Calculate preparation quantities.
5. Review or edit batch-record fields.
6. Copy instructions or print the batch preparation sheet.

The website owns the media requirements. Users do not edit formula data during calculation.

## Scope

### In Scope

- Single-page web application in the existing Next.js app.
- Fixed media database for TSA, SDA, MLA, R2A, TSP, PBS Bioburden, PBS RM, LB, and MLB.
- Optional rounding up to the nearest 100 mL.
- Raw volume, final volume, and additional overage display.
- Powder and additive calculations using final volume.
- Date-aware expiration date and batch number generation.
- Editable preparation date, defaulting to today's date.
- Editable batch record fields that print as entered values or blank lines.
- Printable SOP-style batch preparation sheet.
- Copy Instructions button.
- Warning text for invalid or unusually low calculations.
- Mobile-friendly and print-friendly styling.

### Out of Scope

- User accounts.
- Persistence or saved batch records.
- Server API.
- Approval workflows or audit trails.
- User-editable media database.
- Exact final pH ranges, because the user will verify them later.

## Media Database

Each media entry stores:

- Media code and display name.
- Container type.
- Fill volume in mL.
- Water requirement.
- Dehydrated media concentration in g/L when applicable.
- Additives when applicable.
- pH verification requirement and placeholder pH range when applicable.
- Autoclave requirement.
- Special preparation notes.

Initial media entries:

| Media | Container | Fill Volume | Water | Powder | Additives | Notes |
| --- | --- | ---: | --- | ---: | --- | --- |
| TSA | Bottle | 800 mL | First half WFI, second half Ultrapure Water | 40 g/L | None | pH verification, autoclave |
| SDA | Bottle | 800 mL | Ultrapure Water only | 65 g/L | None | pH verification, autoclave |
| MLA | Bottle | 800 mL | Ultrapure Water only | 72.1 g/L | None | autoclave |
| R2A | Bottle | 800 mL | Ultrapure Water only | 18.2 g/L | None | autoclave |
| TSP | Flask | 400 mL | First half WFI, second half Ultrapure Water | 45.7 g/L | None | pH verification, autoclave |
| PBS Bioburden | Bottle | 100 mL | Ultrapure Water only | Not applicable | PBS Stock Buffer 1.25 mL/L | no dehydrated media powder |
| PBS RM | Bottle | 90 mL | Ultrapure Water only | Not applicable | PBS Stock Buffer 1.25 mL/L; Polysorbate 0.5 mL/L | no dehydrated media powder |
| LB | Test Tube | 9 mL | Ultrapure Water only | 26 g/L | None | double-strength from 13 g/L basis; autoclave |
| MLB | Bottle | 90 mL | Ultrapure Water only | 37.8 g/L | Polysorbate 5 mL/L | autoclave |

Temporary pH ranges should use the non-numeric label `TEMP RANGE - VERIFY BEFORE USE` until verified media-specific ranges are available. Media with no pH verification requirement should omit pH steps from the procedure.

## Calculation Rules

### Volume

Raw volume:

```text
rawVolumeMl = containerCount * fillVolumeMl
```

If rounding is disabled:

```text
finalVolumeMl = rawVolumeMl
```

If rounding is enabled:

```text
finalVolumeMl = ceiling(rawVolumeMl / 100) * 100
```

Additional overage:

```text
overageMl = finalVolumeMl - rawVolumeMl
```

### Powder

For media with dehydrated powder:

```text
powderGrams = finalVolumeMl * gramsPerLiter / 1000
```

Display powder to two decimal places in the calculation summary. In the batch sheet, use the same value with `g` units and the media code.

For PBS Bioburden and PBS RM:

```text
Media Powder Required: Not applicable
```

### Additives

Additives use final volume:

```text
additiveMl = finalVolumeMl * mlPerLiter / 1000
```

Required additives:

- PBS Stock Buffer: 1.25 mL/L for PBS Bioburden and PBS RM.
- Polysorbate: 0.5 mL/L for PBS RM.
- Polysorbate: 5 mL/L for MLB.

### Water

For `Ultrapure Water only`, display the final volume as Ultrapure Water.

For `First half WFI, second half Ultrapure Water`, split the final volume exactly 50/50:

```text
wfiMl = finalVolumeMl / 2
ultrapureWaterMl = finalVolumeMl / 2
```

If the split produces a decimal, display one decimal place.

### Dates

Preparation date defaults to the user's current local date and is editable.

Expiration date:

```text
expirationDate = preparationDate + 14 calendar days
```

Display expiration date as:

```text
18 JUN 2026
```

Batch number:

```text
MEDIA - MMDDYY
```

Example:

```text
SDA - 060426
```

Batch number and expiration date update when the preparation date changes.

## Validation and Warnings

- Blank container count: show warning and do not treat the calculation as ready for printing.
- Zero container count: show warning and do not treat the calculation as ready for printing.
- Final volume under 100 mL: show an unusually low volume warning, but still allow the calculation to display.
- Temporary pH ranges: show `TEMP RANGE - VERIFY BEFORE USE` and text indicating values must be verified before laboratory use.

Warnings must use text, not color alone.

## Batch Preparation Sheet

The batch sheet should be generated automatically after calculation and update when calculation inputs change after the user presses Calculate again.

Required sections:

- Header: `MEDIA PREPARATION SHEET`
- Media
- Batch number
- Preparation date
- Expiration date
- Containers
- Fill volume
- Raw volume
- Final volume
- Additional overage
- Media required
- Additives required when applicable
- Water requirements
- Preparation procedure
- Batch record fields

Batch record fields:

- Prepared By
- Checked By
- Date
- Media Lot
- Autoclave Cycle
- Initial pH
- Final pH
- Comments

Fields are editable on screen. On print, entered values print as text and empty fields print as blank record lines.

## Procedure Generation

For powder media:

1. Weigh the required dehydrated media powder.
2. Add the first water portion.
3. Mix until fully dissolved.
4. Add remaining water and bring to final volume.
5. If pH verification is required, verify pH is within `TEMP RANGE - VERIFY BEFORE USE`.
6. If pH is low, adjust with NaOH.
7. If pH is high, adjust with HCl.
8. If autoclaving is required, autoclave according to SOP.
9. Before dispensing, swirl the container at least 5 times.
10. Dispense into containers.
11. Inspect for clarity and proper fill volume.
12. Complete the preparation log.

For additive-only PBS media:

1. Measure the required Ultrapure Water.
2. Add required PBS Stock Buffer.
3. Add required Polysorbate when applicable.
4. Mix until fully uniform.
5. Bring to final volume if needed.
6. Before dispensing, swirl the container at least 5 times.
7. Dispense into containers.
8. Inspect for clarity and proper fill volume.
9. Complete the preparation log.

Copy Instructions should copy the generated procedure plus the key quantities in plain text.

## UI Design

Use the approved Lab workbench layout:

- Desktop: two-column layout with Input and Calculation Summary cards on the left, Batch Preparation Sheet card on the right.
- Mobile: stacked layout in this order: Input, Calculation Summary, Batch Preparation Sheet.
- Print: hide app-only controls and print the batch sheet as a clean record.

Cards:

- Input Section
- Calculation Summary
- Batch Preparation Sheet

Visual direction:

- Clean, modern, laboratory-professional.
- Restrained neutral surfaces with deep teal for primary actions and important calculated values.
- No decorative hero, gradients, glass panels, or marketing sections.
- Compact headings so the calculator remains the first-screen experience.

## Architecture

Use a small client-side architecture:

- `media-database.ts`: fixed media entries and domain types.
- `calculator.ts`: pure functions for volumes, powder, additives, water, dates, warnings, and generated procedures.
- `MediaPreparationCalculator.tsx`: client component for form state, calculate action, copy, print, and record-field editing.
- `page.tsx`: route shell that renders the calculator.
- `globals.css`: print rules and global visual tokens.

This keeps calculation logic inspectable and testable without mixing it into JSX.

## Testing and Verification

Test calculation helpers for:

- Raw volume.
- Optional round-up behavior.
- Overage.
- Powder calculations with two-decimal display.
- PBS additive-only behavior.
- PBS Stock Buffer and Polysorbate calculations.
- Water splitting after rounding.
- R2A at 18.2 g/L.
- LB double-strength calculation at 26 g/L.
- Expiration date at preparation date plus 14 days.
- Expiration date format.
- Batch number format.
- Warning cases.

Manual verification:

- Desktop layout shows input/summary left and sheet right.
- Mobile layout stacks cleanly.
- Print preview hides controls and prints the batch sheet.
- Copy Instructions copies the expected plain text.
- Temporary pH range warning is visible for relevant media.

## Open Follow-Up

Replace `TEMP RANGE - VERIFY BEFORE USE` with verified media-specific ranges before using the app for final laboratory records.
