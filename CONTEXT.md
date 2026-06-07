# Media Preparation Calculator Context

This context defines the laboratory language used by the media calculator. It keeps calculation, container, and batch-record terms precise before implementation details are chosen.

## Language

**Media**:
A laboratory preparation type selected by the user, such as TSA, SDA, MLA, R2A, TSP, PBS Bioburden, PBS RM, LB, or MLB.
_Avoid_: Formula, recipe, product

**Media database**:
The fixed in-application source of truth for each media's container type, fill volume, water requirements, reagent or additive requirements, pH requirement, and preparation notes.
_Avoid_: User-editable database, spreadsheet

**Container**:
The physical unit filled during preparation: bottle, flask, or test tube.
_Avoid_: Vessel, item

**Batch preparation sheet**:
A printable, SOP-style record generated from a selected media and container count.
_Avoid_: Report, receipt

**Batch record field**:
An on-screen editable field that prints as a filled value when entered or as a blank record line when empty.
_Avoid_: Saved form field, database field

**pH range**:
The acceptable pH interval associated with a media that requires pH verification.
_Avoid_: pH target

**Double-strength LB**:
LB prepared at twice its 13 g/L basis, so the calculator uses 26 g/L.
_Avoid_: Editable LB concentration

**Expiration date**:
The date 14 calendar days after the preparation date, formatted for records as `DD MMM YYYY`.
_Avoid_: Shelf life calculation

**Batch number**:
The record identifier formed from the selected media code and preparation date, such as `SDA - 060426`.
_Avoid_: Lot number, media lot

## Relationships

- A **Media** belongs to exactly one **Media database** entry.
- A **Media database** entry defines exactly one **Container** type.
- A **Batch preparation sheet** is generated from one selected **Media** and one container count.
- A **Batch preparation sheet** contains multiple **Batch record fields**.
- A **pH range** exists only for **Media** that require pH verification.
- **Double-strength LB** is calculated at 26 g/L.
- An **Expiration date** is calculated from the preparation date.
- A **Batch number** is generated from one selected **Media** and the preparation date.

## Example dialogue

> **Dev:** "Can users change the grams-per-liter value while calculating?"
> **Domain expert:** "No. They select the **Media** and enter the number of **Containers**. The **Media database** already knows the required volume and reagent concentration."

## Flagged ambiguities

- "Editable value in media database" appeared in the initial brief for R2A and LB, but the resolved journey says the website already knows media requirements. Current resolution: users do not edit media requirements during calculation.
- Exact **pH ranges** are not final yet. Temporary placeholder ranges may be used during implementation and must be labeled as values to verify before laboratory use.
