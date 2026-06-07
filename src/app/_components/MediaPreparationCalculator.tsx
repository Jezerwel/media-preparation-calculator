"use client";

import { useMemo, useState } from "react";

import {
  calculateBatch,
  formatDateInputValue,
  formatGrams,
  formatRecordDate,
  formatVolume,
  generateInstructionText,
  parseDateInputValue,
  pluralize,
  type BatchCalculation,
} from "~/lib/calculator";
import { MEDIA_DATABASE, getMediaByCode } from "~/lib/media-database";

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
  const [mediaCode, setMediaCode] = useState<string>(
    MEDIA_DATABASE[0]?.code ?? "TSA",
  );
  const [containerCountText, setContainerCountText] = useState("");
  const [roundToNearestHundred, setRoundToNearestHundred] = useState(false);
  const [preparationDateText, setPreparationDateText] = useState(
    formatDateInputValue(today),
  );
  const [hasCalculated, setHasCalculated] = useState(false);
  const [recordFields, setRecordFields] =
    useState<BatchRecordFields>(emptyRecordFields);
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
          <p className="text-sm font-semibold tracking-[0.12em] text-[var(--teal)] uppercase">
            Laboratory calculator
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Media Preparation Calculator
          </h1>
          <p className="max-w-3xl text-sm text-[var(--muted)]">
            Select a media, enter the container count, and generate preparation
            quantities with a printable batch sheet.
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
            <SummaryCard
              calculation={calculation}
              hasCalculated={hasCalculated}
            />
          </section>

          <BatchSheet
            calculation={calculation}
            hasCalculated={hasCalculated}
            instructions={instructions}
            recordFields={recordFields}
            copyStatus={copyStatus}
            onCopyInstructions={() => void copyInstructions()}
            onPrint={() => window.print()}
            onRecordFieldChange={updateRecordField}
          />
        </div>
      </div>
    </main>
  );
}

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
        <select
          id="media"
          value={props.mediaCode}
          onChange={(event) => props.onMediaChange(event.target.value)}
        >
          {MEDIA_DATABASE.map((media) => (
            <option key={media.code} value={media.code}>
              {media.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="container-count">
          Number of {pluralize(selectedMedia.containerType, 2)}
        </label>
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
          onChange={(event) =>
            props.onPreparationDateChange(event.target.value)
          }
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
      <button
        className="primary-button w-full"
        type="button"
        onClick={props.onCalculate}
      >
        Calculate
      </button>
    </section>
  );
}

function SummaryCard({
  calculation,
  hasCalculated,
}: {
  calculation: BatchCalculation;
  hasCalculated: boolean;
}) {
  return (
    <section className="lab-card">
      <h2 className="card-title">Calculation Summary</h2>
      {!hasCalculated ? (
        <p className="text-sm text-[var(--muted)]">
          Enter a container count and click Calculate.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2 text-sm">
            <SummaryLine label="Media" value={calculation.media.name} />
            <SummaryLine
              label="Containers"
              value={`${calculation.containerCount} ${pluralize(
                calculation.media.containerType,
                calculation.containerCount,
              )}`}
            />
            <SummaryLine
              label="Fill Volume"
              value={formatVolume(calculation.media.fillVolumeMl)}
            />
            <SummaryLine
              label="Raw Volume"
              value={formatVolume(calculation.rawVolumeMl)}
            />
            <SummaryLine
              label="Final Volume"
              value={formatVolume(calculation.finalVolumeMl)}
              isEmphasized
            />
            <SummaryLine
              label="Additional Overage"
              value={formatVolume(calculation.overageMl)}
            />
            <SummaryLine
              label="Media Powder"
              value={
                calculation.powderGrams === null
                  ? "Not applicable"
                  : `${formatGrams(calculation.powderGrams)} ${
                      calculation.media.powderLabel ?? calculation.media.code
                    }`
              }
            />
          </div>

          <QuantityList title="Water Requirements">
            {calculation.waterRequirements.map((line) => (
              <SummaryLine
                key={line.label}
                label={line.label}
                value={formatVolume(line.volumeMl)}
              />
            ))}
          </QuantityList>

          {calculation.additives.length > 0 ? (
            <QuantityList title="Additives Required">
              {calculation.additives.map((additive) => (
                <SummaryLine
                  key={additive.name}
                  label={additive.name}
                  value={formatVolume(additive.volumeMl)}
                />
              ))}
            </QuantityList>
          ) : null}

          {calculation.warnings.length > 0 ? (
            <WarningList warnings={calculation.warnings} />
          ) : null}
        </div>
      )}
    </section>
  );
}

function BatchSheet({
  calculation,
  hasCalculated,
  instructions,
  recordFields,
  copyStatus,
  onCopyInstructions,
  onPrint,
  onRecordFieldChange,
}: {
  calculation: BatchCalculation;
  hasCalculated: boolean;
  instructions: string;
  recordFields: BatchRecordFields;
  copyStatus: string;
  onCopyInstructions: () => void;
  onPrint: () => void;
  onRecordFieldChange: (field: keyof BatchRecordFields, value: string) => void;
}) {
  return (
    <section className="lab-card batch-sheet">
      <div className="mb-4 flex flex-col gap-3 border-b border-[var(--rule)] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[var(--teal)] uppercase">
            MEDIA PREPARATION SHEET
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {calculation.media.name}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            className="secondary-button"
            type="button"
            disabled={!hasCalculated}
            onClick={onCopyInstructions}
          >
            Copy Instructions
          </button>
          <button
            className="primary-button"
            type="button"
            disabled={!hasCalculated}
            onClick={onPrint}
          >
            Print Batch Sheet
          </button>
        </div>
      </div>

      {!hasCalculated ? (
        <p className="text-sm text-[var(--muted)] print:hidden">
          The batch sheet will populate after calculation.
        </p>
      ) : (
        <div className="space-y-5">
          {copyStatus ? (
            <p className="text-sm font-semibold text-[var(--teal)] print:hidden">
              {copyStatus}
            </p>
          ) : null}

          {calculation.warnings.length > 0 ? (
            <WarningList warnings={calculation.warnings} />
          ) : null}

          <SheetSection title="Batch Details">
            <SheetGrid>
              <SummaryLine label="Media" value={calculation.media.name} />
              <SummaryLine
                label="Batch Number"
                value={calculation.batchNumber}
              />
              <SummaryLine
                label="Preparation Date"
                value={formatRecordDate(calculation.preparationDate)}
              />
              <SummaryLine
                label="Expiration Date"
                value={formatRecordDate(calculation.expirationDate)}
              />
              <SummaryLine
                label="Containers"
                value={`${calculation.containerCount} ${pluralize(
                  calculation.media.containerType,
                  calculation.containerCount,
                )}`}
              />
              <SummaryLine
                label="Fill Volume"
                value={formatVolume(calculation.media.fillVolumeMl)}
              />
              <SummaryLine
                label="Raw Volume"
                value={formatVolume(calculation.rawVolumeMl)}
              />
              <SummaryLine
                label="Final Volume"
                value={formatVolume(calculation.finalVolumeMl)}
              />
              <SummaryLine
                label="Additional Overage"
                value={formatVolume(calculation.overageMl)}
              />
              <SummaryLine
                label="Media Required"
                value={
                  calculation.powderGrams === null
                    ? "Not applicable"
                    : `${formatGrams(calculation.powderGrams)} ${
                        calculation.media.powderLabel ?? calculation.media.code
                      }`
                }
              />
              {calculation.phRange ? (
                <SummaryLine label="pH Range" value={calculation.phRange} />
              ) : null}
            </SheetGrid>
          </SheetSection>

          {calculation.additives.length > 0 ? (
            <SheetSection title="Additives Required">
              <SheetGrid>
                {calculation.additives.map((additive) => (
                  <SummaryLine
                    key={additive.name}
                    label={additive.name}
                    value={formatVolume(additive.volumeMl)}
                  />
                ))}
              </SheetGrid>
            </SheetSection>
          ) : null}

          <SheetSection title="Water Requirements">
            <SheetGrid>
              {calculation.waterRequirements.map((line) => (
                <SummaryLine
                  key={line.label}
                  label={line.label}
                  value={formatVolume(line.volumeMl)}
                />
              ))}
            </SheetGrid>
          </SheetSection>

          <SheetSection title="Preparation Procedure">
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
              {instructions
                .split("\n")
                .filter((line) => /^\d+\./.test(line))
                .map((line) => (
                  <li key={line}>{line.replace(/^\d+\.\s*/, "")}</li>
                ))}
            </ol>
          </SheetSection>

          <SheetSection title="Batch Record Fields">
            <div className="grid gap-3 sm:grid-cols-2">
              <RecordField
                label="Prepared By"
                value={recordFields.preparedBy}
                onChange={(value) => onRecordFieldChange("preparedBy", value)}
              />
              <RecordField
                label="Checked By"
                value={recordFields.checkedBy}
                onChange={(value) => onRecordFieldChange("checkedBy", value)}
              />
              <RecordField
                label="Date"
                value={recordFields.date}
                onChange={(value) => onRecordFieldChange("date", value)}
              />
              <RecordField
                label="Media Lot"
                value={recordFields.mediaLot}
                onChange={(value) => onRecordFieldChange("mediaLot", value)}
              />
              <RecordField
                label="Autoclave Cycle"
                value={recordFields.autoclaveCycle}
                onChange={(value) =>
                  onRecordFieldChange("autoclaveCycle", value)
                }
              />
              <RecordField
                label="Initial pH"
                value={recordFields.initialPh}
                onChange={(value) => onRecordFieldChange("initialPh", value)}
              />
              <RecordField
                label="Final pH"
                value={recordFields.finalPh}
                onChange={(value) => onRecordFieldChange("finalPh", value)}
              />
              <RecordField
                label="Comments"
                value={recordFields.comments}
                isTextarea
                onChange={(value) => onRecordFieldChange("comments", value)}
              />
            </div>
          </SheetSection>
        </div>
      )}
    </section>
  );
}

function SummaryLine({
  label,
  value,
  isEmphasized = false,
}: {
  label: string;
  value: string;
  isEmphasized?: boolean;
}) {
  return (
    <div className="summary-line">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd
        className={
          isEmphasized
            ? "font-bold text-[var(--teal)]"
            : "font-semibold text-[var(--ink)]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function QuantityList({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <dl className="grid gap-2 text-sm">{children}</dl>
    </div>
  );
}

function SheetSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sheet-section">
      <h3 className="sheet-title">{title}</h3>
      {children}
    </section>
  );
}

function SheetGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-2 sm:grid-cols-2">{children}</dl>;
}

function WarningList({ warnings }: { warnings: string[] }) {
  return (
    <div className="warning-box">
      <p className="font-bold">Warnings</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}

function RecordField({
  label,
  value,
  isTextarea = false,
  onChange,
}: {
  label: string;
  value: string;
  isTextarea?: boolean;
  onChange: (value: string) => void;
}) {
  const controlId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="field-group record-field">
      <label htmlFor={controlId}>{label}</label>
      {isTextarea ? (
        <textarea
          id={controlId}
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={controlId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <div className="record-print-line" aria-hidden="true">
        {value}
      </div>
    </div>
  );
}
