"use client";

import { useMemo, useState } from "react";

import {
  BATCH_RECORD_ROWS,
  type BatchRecordAutomaticValueKey,
  type BatchRecordInputKey,
  type BatchRecordInputType,
} from "~/lib/batch-record-fields";
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

type BatchRecordFields = Record<BatchRecordInputKey, string>;

const emptyRecordFields: BatchRecordFields = {
  lotNumber: "",
  mediaExpirationDate: "",
  actualWeight: "",
  actualPh: "",
  bottleNumber: "",
  preparedBy: "",
  checkedBy: "",
};

const AUTOCLAVE_CYCLE = "121°C 20 minutes";

export function MediaPreparationCalculator() {
  const today = useMemo(() => new Date(), []);
  const [mediaCode, setMediaCode] = useState<string>(
    MEDIA_DATABASE[0]?.code ?? "TSA",
  );
  const [containerCountText, setContainerCountText] = useState("");
  const [roundToNearestHundred, setRoundToNearestHundred] = useState(false);
  const [roundToNearestThousand, setRoundToNearestThousand] = useState(false);
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
    roundToNearestThousand,
    preparationDate,
  });
  const instructions = generateInstructionText(calculation);

  function updateRecordField(field: keyof BatchRecordFields, value: string) {
    setRecordFields((current) => ({ ...current, [field]: value }));
  }

  async function copyInstructions() {
    await navigator.clipboard.writeText(instructions);
    setCopyStatus("Instructions copied");
    setTimeout(() => setCopyStatus(""), 3000);
  }

  return (
    <main className="lab-layout">
      <header className="lab-header print:hidden">
        <p className="lab-header__eyebrow">Laboratory Calculator</p>
        <h1 className="lab-header__title">Media Preparation Calculator</h1>
        <p className="lab-header__desc">
          Select a media type, enter the container count, and generate
          preparation quantities with a printable SOP batch sheet.
        </p>
      </header>

      <div className="lab-grid">
        <section className="space-y-[1.25rem] print:hidden">
          <InputCard
            mediaCode={mediaCode}
            containerCountText={containerCountText}
            roundToNearestHundred={roundToNearestHundred}
            roundToNearestThousand={roundToNearestThousand}
            preparationDateText={preparationDateText}
            onMediaChange={setMediaCode}
            onContainerCountChange={setContainerCountText}
            onRoundHundredChange={(checked) => {
              setRoundToNearestHundred(checked);
              if (checked) setRoundToNearestThousand(false);
            }}
            onRoundThousandChange={(checked) => {
              setRoundToNearestThousand(checked);
              if (checked) setRoundToNearestHundred(false);
            }}
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
    </main>
  );
}

function InputCard(props: {
  mediaCode: string;
  containerCountText: string;
  roundToNearestHundred: boolean;
  roundToNearestThousand: boolean;
  preparationDateText: string;
  onMediaChange: (value: string) => void;
  onContainerCountChange: (value: string) => void;
  onRoundHundredChange: (value: boolean) => void;
  onRoundThousandChange: (value: boolean) => void;
  onPreparationDateChange: (value: string) => void;
  onCalculate: () => void;
}) {
  const selectedMedia = getMediaByCode(props.mediaCode);

  return (
    <section className="lab-card">
      <div className="card-header">
        <h2 className="card-title">Parameters</h2>
      </div>

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
          placeholder="e.g. 20"
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
          onChange={(event) =>
            props.onRoundHundredChange(event.target.checked)
          }
        />
        <span>Round final volume up to nearest 100 mL</span>
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={props.roundToNearestThousand}
          onChange={(event) =>
            props.onRoundThousandChange(event.target.checked)
          }
        />
        <span>Round final volume up to nearest 1000 mL</span>
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
      <div className="card-header">
        <h2 className="card-title">Calculation Summary</h2>
        {hasCalculated && <span className="card-badge">Ready</span>}
      </div>

      {!hasCalculated ? (
        <div className="empty-state">
          <span className="empty-state__icon" aria-hidden="true">⚗</span>
          <p className="empty-state__text">
            Enter a container count and click Calculate to see results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <dl className="grid gap-0">
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
          </dl>

          <QuantityGroup title="Water Requirements">
            {calculation.waterRequirements.map((line) => (
              <SummaryLine
                key={line.label}
                label={line.label}
                value={formatVolume(line.volumeMl)}
              />
            ))}
          </QuantityGroup>

          {calculation.additives.length > 0 ? (
            <QuantityGroup title="Additives Required">
              {calculation.additives.map((additive) => (
                <SummaryLine
                  key={additive.name}
                  label={additive.name}
                  value={formatVolume(additive.volumeMl)}
                />
              ))}
            </QuantityGroup>
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
      <div className="batch-header">
        <div className="batch-header__meta">
          <p className="batch-header__eyebrow">Media Preparation Sheet</p>
          <h2 className="batch-header__title">{calculation.media.name}</h2>
        </div>
        <div className="batch-header__actions print:hidden">
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
        <div className="empty-state print:hidden">
          <span className="empty-state__icon" aria-hidden="true">📋</span>
          <p className="empty-state__text">
            The batch sheet will populate after you click Calculate.
          </p>
        </div>
      ) : (
        <div className="space-y-[1rem]">
          {copyStatus ? (
            <p className="copy-confirm print:hidden">{copyStatus}</p>
          ) : null}

          {calculation.warnings.length > 0 ? (
            <WarningList warnings={calculation.warnings} />
          ) : null}

          <SheetSection title="Batch Details">
            <dl className="sheet-grid">
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
                isEmphasized
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
              {calculation.media.requiresAutoclaving ? (
                <SummaryLine
                  label="Autoclave Cycle"
                  value={AUTOCLAVE_CYCLE}
                />
              ) : null}
            </dl>
          </SheetSection>

          {calculation.additives.length > 0 ? (
            <SheetSection title="Additives Required">
              <dl className="sheet-grid">
                {calculation.additives.map((additive) => (
                  <SummaryLine
                    key={additive.name}
                    label={additive.name}
                    value={formatVolume(additive.volumeMl)}
                  />
                ))}
              </dl>
            </SheetSection>
          ) : null}

          <SheetSection title="Water Requirements">
            <dl className="sheet-grid">
              {calculation.waterRequirements.map((line) => (
                <SummaryLine
                  key={line.label}
                  label={line.label}
                  value={formatVolume(line.volumeMl)}
                />
              ))}
            </dl>
          </SheetSection>

          <SheetSection title="Preparation Procedure">
            <ol className="prep-steps">
              {instructions
                .split("\n")
                .filter((line) => /^\d+\./.test(line))
                .map((line, i) => (
                  <li key={i}>{line.replace(/^\d+\.\s*/, "")}</li>
                ))}
            </ol>
          </SheetSection>

          <SheetSection title="Batch Record Fields">
            <div className="grid gap-3 sm:grid-cols-2">
              {BATCH_RECORD_ROWS.map((row) =>
                row.kind === "automatic" ? (
                  <SummaryLine
                    key={row.label}
                    label={row.label}
                    value={getBatchRecordAutomaticValue(
                      row.valueKey,
                      calculation,
                    )}
                  />
                ) : (
                  <RecordField
                    key={row.key}
                    label={row.label}
                    inputType={row.inputType}
                    value={recordFields[row.key]}
                    onChange={(value) => onRecordFieldChange(row.key, value)}
                  />
                ),
              )}
            </div>
          </SheetSection>
        </div>
      )}
    </section>
  );
}

function getBatchRecordAutomaticValue(
  valueKey: BatchRecordAutomaticValueKey,
  calculation: BatchCalculation,
): string {
  if (valueKey === "mediaName") return calculation.media.name;
  if (valueKey === "batchNumber") return calculation.batchNumber;
  return formatRecordDate(calculation.expirationDate);
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
      <dt>{label}</dt>
      <dd className={isEmphasized ? "is-emphasized" : ""}>{value}</dd>
    </div>
  );
}

function QuantityGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="quantity-group">
      <p className="quantity-group__header">{title}</p>
      <dl className="quantity-group__body">{children}</dl>
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

function WarningList({ warnings }: { warnings: string[] }) {
  return (
    <div className="warning-box" role="alert">
      <span className="warning-box__icon" aria-hidden="true">⚠</span>
      <div className="warning-box__body">
        <p className="warning-box__title">Warnings</p>
        <ul>
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecordField({
  label,
  value,
  inputType,
  onChange,
}: {
  label: string;
  value: string;
  inputType: BatchRecordInputType;
  onChange: (value: string) => void;
}) {
  const controlId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="field-group record-field">
      <label htmlFor={controlId}>{label}</label>
      <input
        id={controlId}
        type={inputType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="record-print-line" aria-hidden="true">
        {value}
      </div>
    </div>
  );
}
