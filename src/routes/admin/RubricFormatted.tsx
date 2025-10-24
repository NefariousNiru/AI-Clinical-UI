// src/routes/admin/RubricFormatted.tsx
import { titleize } from "../../lib/functions";
import type {
  RubricPayload,
  Section,
  Block,
  Criterion,
  CriterionBinary,
  CriterionSelectK,
  SelectKItem,
  ScoringInvariants,
} from "../../types/rubric";

function Title({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold text-gray-800">{children}</div>;
}

function isBinary(c: Criterion): c is CriterionBinary {
  return c.type === "binary";
}
function isSelectK(c: Criterion): c is CriterionSelectK {
  return c.type === "select_k";
}

export default function RubricFormatted({ rubric }: { rubric: RubricPayload }) {
  const si: ScoringInvariants = rubric.scoringInvariants;

  const evidenceKeys = Array.isArray(rubric.evidenceKeys)
    ? rubric.evidenceKeys
    : [];

  const sections = Array.isArray(rubric.sections) ? rubric.sections : [];

  return (
    <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
      <div className="rounded-lg border border-gray-200">
        <div className="border-b bg-gray-50 px-4 py-2">
          <Title>
            {titleize(rubric.rubricId)} v{rubric.rubricVersion} — Schema: {rubric.schemaVersion}
          </Title>
          <div className="text-xs text-gray-600">
            {si.rounding && <>rounding: {si.rounding} • </>}
            {"requireSectionBlockSumsMatch" in si && si.requireSectionBlockSumsMatch !== undefined && (
              <>require sums match: {String(si.requireSectionBlockSumsMatch)} • </>
            )}
            {si.gradingStyle && <>style: {si.gradingStyle}</>}
            {si.evidenceScope && <> • evidenceScope: {si.evidenceScope}</>}
          </div>
          {si.notes && <div className="text-xs text-gray-500 mt-1">{si.notes}</div>}
        </div>

        <div className="p-4">
          {evidenceKeys.length > 0 && (
            <div className="mb-3 text-xs text-gray-700">
              <span className="font-medium">Evidence keys:</span>{" "}
              {evidenceKeys.join(", ")}
            </div>
          )}

          {sections.map((sec: Section) => (
            <div
              key={sec.id}
              className="mb-4 rounded-md border border-gray-200"
            >
              <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
                <Title>{sec.title}</Title>
                <div className="text-xs text-gray-600">
                  Max: {sec.maxPoints}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {sec.blocks.map((b: Block) => (
                  <div
                    key={b.id}
                    className="rounded-md border border-gray-200 bg-white p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-800">
                        {b.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        Max: {b.maxPoints}
                      </div>
                    </div>

                    {b.notes && (
                      <div className="mb-2 text-xs text-gray-600">
                        Notes: {b.notes}
                      </div>
                    )}

                    <ul className="text-sm text-gray-800 list-disc pl-5 space-y-1">
                      {b.criteria.map((c: Criterion, i: number) => {
                        if (isBinary(c)) {
                          return (
                            <li key={i}>
                              <span className="font-medium">
                                [Type: Binary, Points: {c.weight}]
                              </span>{" "}
                              {c.verbiage}
                            </li>
                          );
                        }

                        if (isSelectK(c)) {
                          return (
                            <li key={i}>
                              <div className="font-medium">
                                [Type: Select {c.selectK} → {c.awardPoints} Points]{" "}
                                {c.verbiage}
                              </div>

                              {(Array.isArray(c.dependsOnAny) &&
                                c.dependsOnAny.length > 0) ||
                              typeof c.minItemsRequired === "number" ? (
                                <div className="mt-1 text-xs text-gray-600">
                                  {Array.isArray(c.dependsOnAny) &&
                                    c.dependsOnAny.length > 0 && (
                                      <span>
                                        dependsOnAny:{" "}
                                        {c.dependsOnAny.join(", ")}
                                      </span>
                                    )}
                                  {typeof c.minItemsRequired === "number" && (
                                    <>
                                      {c.dependsOnAny?.length ? " • " : ""}
                                      minItemsRequired: {c.minItemsRequired}
                                    </>
                                  )}
                                </div>
                              ) : null}

                              {Array.isArray(c.items) && c.items.length > 0 && (
                                <ul className="list-disc pl-5 mt-1">
                                  {c.items.map((it: SelectKItem) => (
                                    <li key={it.key}>{it.verbiage}</li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        }

                        const _never: never = c;
                        return _never;
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Array.isArray(rubric.nonScoredClinicalNotes) &&
            rubric.nonScoredClinicalNotes.length > 0 && (
              <div className="text-xs text-gray-700">
                <span className="font-medium">Notes:</span>{" "}
                {rubric.nonScoredClinicalNotes.join(" • ")}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
