<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->
---
name: Media Preparation Calculator
description: A restrained laboratory calculator for media preparation quantities and printable SOP-style batch sheets.
---

# Design System: Media Preparation Calculator

## 1. Overview

**Creative North Star: "The Lab Bench Clipboard"**

The visual system should feel like a clean SOP batch record clipped to a lab bench clipboard: structured, legible, and ready for repeated use by laboratory personnel. The product is not a brand campaign; it is a work surface for calculating media quantities, reviewing units, and producing a print-friendly batch sheet.

Use quiet hierarchy, restrained color, and precise alignment. The interface should guide attention from inputs to calculation summary to batch preparation sheet without visual theatrics. Every visual decision should make the calculation easier to verify or the printed record easier to read.

This system explicitly rejects the generic SaaS dashboard look: no decorative metric cards, no hero gradients, no marketing polish, no glass panels, and no oversized presentation typography.

**Key Characteristics:**

- Restrained laboratory utility
- Print-first batch record clarity
- Deep teal accent used sparingly
- Single technical sans typography
- State-only motion, never decorative motion

## 2. Colors

The palette is restrained: neutral clinical surfaces with one controlled deep teal accent for primary actions, focus states, and key calculated values.

### Primary

- **Deep Verification Teal** ([to be resolved during implementation]): Use for the Calculate button, focused controls, selected states, and the most important calculated totals. It should appear on less than 10 percent of any screen.

### Neutral

- **Record White** ([to be resolved during implementation]): Use for printable sheet surfaces, input cards, and batch-record fields.
- **Bench Surface** ([to be resolved during implementation]): Use for the page background and subtle separation between cards.
- **Ink Black** ([to be resolved during implementation]): Use for primary text, field labels, and printed output.
- **Rule Gray** ([to be resolved during implementation]): Use for borders, dividers, table rules, and empty record lines.
- **Warning Amber** ([to be resolved during implementation]): Use only for unusually low or zero calculated values, never as decoration.

### Named Rules

**The Teal Under Ten Rule.** Deep teal is reserved for action, focus, and verification. If teal covers more than 10 percent of the page, the interface is becoming decorative.

**The Print Survives Rule.** Any color choice must still work when printed in grayscale. Meaning cannot depend on color alone.

## 3. Typography

**Display Font:** [single technical sans to be chosen during implementation]
**Body Font:** [same technical sans to be chosen during implementation]
**Label/Mono Font:** [not separate unless numeric alignment requires it during implementation]

**Character:** The type should feel precise, compact, and professional. Use one technical sans family across headings, labels, inputs, results, and batch sheet text so the UI reads like one coherent laboratory tool.

### Hierarchy

- **Display** (600-700 weight, fixed rem size to be resolved): Page title only. It must not feel like a marketing hero.
- **Headline** (600 weight, fixed rem size to be resolved): Card titles such as Input, Calculation Summary, and Batch Preparation Sheet.
- **Title** (600 weight, fixed rem size to be resolved): Result group labels, media names, and batch sheet section headings.
- **Body** (400 weight, fixed rem size to be resolved): Instructions, values, and explanatory text. Keep prose lines readable, especially in the batch sheet.
- **Label** (500-600 weight, fixed rem size to be resolved): Form labels, units, small field captions, and print record labels. Use sentence case.

### Named Rules

**The No Hero Type Rule.** This is a calculator, not a landing page. Headings must stay compact enough that inputs and results remain visible without scrolling on common laptop screens.

**The Units Stay Attached Rule.** Numeric values and units must read as a pair. Never let labels, values, and units drift into separate visual systems.

## 4. Elevation

The system is flat by default and uses tonal layering, borders, and spacing instead of decorative shadows. Cards can sit on a slightly different neutral surface, but printable batch-sheet content should rely on clean rules and section spacing rather than depth effects.

### Named Rules

**The Paper Over Shadow Rule.** If a section needs emphasis, make it read like a clearer record sheet, not like a floating app card.

**The State-Only Motion Rule.** Motion is limited to hover, focus, validation, and calculation updates. No page-load choreography, scroll reveals, or animated decoration.

## 5. Components

### Buttons

- **Shape:** Practical and modestly rounded ([exact radius to be resolved], likely 6-8px).
- **Primary:** Deep teal background with white text, used for Calculate and the main print action.
- **Hover / Focus:** Subtle tone shift and clear focus ring. Focus must be visible without relying on color alone.
- **Secondary:** White or neutral background with a clear border, used for Copy Instructions and lower-priority actions.

### Cards / Containers

- **Corner Style:** Modest radius ([exact radius to be resolved], likely 8px).
- **Background:** Record White for cards and batch sheet content; Bench Surface for the page.
- **Shadow Strategy:** Flat by default. Use borders and tonal contrast instead of decorative shadow.
- **Border:** Rule Gray borders for card boundaries, print fields, and calculation grouping.
- **Internal Padding:** Comfortable enough for mobile touch targets while preserving dense lab readability.

### Inputs / Fields

- **Style:** White fields with clear borders, compact labels, and visible units.
- **Focus:** Deep teal border or ring plus a non-color cue where practical.
- **Error / Warning:** Warning Amber with explicit warning text for zero or unusually low values.
- **Disabled:** Muted neutral treatment, never low-contrast text.

### Batch Sheet

- **Style:** SOP record sheet, not dashboard output.
- **Structure:** Clear section headings, aligned labels and values, printable record lines, and enough spacing for handwritten entries.
- **Print Behavior:** Hide app-only controls, preserve batch sheet hierarchy, and keep fields legible in grayscale.

## 6. Do's and Don'ts

### Do:

- **Do** keep the design restrained, professional, and calculation-first.
- **Do** use deep teal only for primary actions, focus states, selected states, and key calculated totals.
- **Do** make the batch sheet readable and credible when printed.
- **Do** keep all warnings textual as well as visual.
- **Do** use consistent cards for Input Section, Calculation Summary, and Batch Preparation Sheet.
- **Do** keep the app mobile-friendly without turning it into a stack of oversized marketing panels.

### Don't:

- **Don't** make this look like a generic SaaS dashboard.
- **Don't** use decorative metric cards, hero gradients, glass panels, or marketing polish.
- **Don't** make it feel like a playful classroom exercise, dense spreadsheet, or decorative medical-device mockup.
- **Don't** use color as the only carrier of warning or calculation meaning.
- **Don't** use oversized display type that pushes the calculator workflow below the fold.
- **Don't** add motion that does not communicate state.
