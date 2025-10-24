// src/routes/admin/Dashboard.tsx
import { useMemo, useState } from "react";
import PromptEditor from "./PromptEditor";
import OutputPanel from "./OutputPanel";
import SubmissionList from "./SubmissionList";
import SubmissionViewer from "./SubmissionViewer";
import type { StudentSubmission, ProblemFeedbackList } from "../../types/admin";
import { chat } from "../../services/adminApi";
import { saveSession } from "../../lib/localSession";
import { titleize } from "../../lib/functions";
import RubricViewer from "./RubricViewer";
import { useSystemPrompt } from "./hooks/useSystemPrompt";
import { useSubmissions } from "./hooks/useSubmissions";
import { useModels } from "./hooks/useModels";
import { useRubrics } from "./hooks/useRubrics";
import { ApiError } from "../../lib/http";

/*
1) Page goals:
   - Load: prompt, submissions (paged), models, rubric ids.
   - Act: grade selected submission with current prompt + model.
   - Store: save successful runs locally.
   - Inspect: open viewers (submission, rubric).
2) Typing rules:
   - No `any` casts. Narrow unknown errors via `instanceof`.
   - Avoid redundant type assertions when hooks/services are typed.
*/

// 3) Error normalization for this page only (UI-friendly)
function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message || "Request failed";
  if (e instanceof Error) return e.message || "Request failed";
  return "Request failed";
}

export default function Dashboard() {
  // system prompt
  const { prompt, setPrompt, loading: loadingPrompt } = useSystemPrompt();

  // submissions
  const {
    items: subs,
    total,
    page,
    limit,
    loading: loadingSubs,
    setPage,
  } = useSubmissions(1, 10);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // models
  const { models, model, setModel, loading: modelsLoading } = useModels();
  const modelsUnavailable = models.length === 0;

  // rubric catalog + detail
  const {
    ids: rubricIds,
    loading: rubricIdsLoading,
    selectedId: selectedRubricId,
    setSelectedId: setSelectedRubricId,
    detail: rubricData,
    loadingDetail: rubricLoading,
    fetchOne: fetchRubric,
  } = useRubrics();
  const [rubricOpen, setRubricOpen] = useState<boolean>(false);

  // submission viewer
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [viewerData, setViewerData] = useState<StudentSubmission | null>(null);

  // grading output
  const [feedback, setFeedback] = useState<ProblemFeedbackList | null>(null);
  const [outputMsg, setOutputMsg] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  // save status
  const [saveMsg, setSaveMsg] = useState<string>("");

  const [gradedSubmission, setGradedSubmission] =
    useState<StudentSubmission | null>(null);

  // 4) Adapt submissions to list row shape (typed)
  const listItems = useMemo(
    () =>
      subs.map((s) => ({
        id: s.id as number,
        title: `Submission #${s.id}`,
        subtitle: s.synthetic ? "Synthetic" : "Student",
      })),
    [subs]
  );

  // 5) Grade current selection
  async function handleSend(): Promise<void> {
    const sub =
      selectedId != null ? subs.find((s) => s.id === selectedId) : undefined;
    if (!sub) {
      setFeedback(null);
      setOutputMsg(
        "Select a submission from the list on the right, then press Send."
      );
      return;
    }

    setSending(true);
    setFeedback(null);
    setOutputMsg("Processing…");
    setGradedSubmission(sub);

    try {
      const resp = await chat({
        studentSubmission: sub,
        systemPrompt: prompt,
        modelName: model,
      });
      setFeedback(resp);
      setOutputMsg("");
    } catch (e: unknown) {
      setFeedback(null);
      setOutputMsg(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  // 6) Local save guard
  function canSave(): { ok: true } | { ok: false; reason: string } {
    if (!(prompt || "").trim())
      return { ok: false, reason: "System prompt is empty." };
    if (selectedId == null)
      return { ok: false, reason: "No submission selected." };
    if (!Array.isArray(feedback) || feedback.length === 0)
      return { ok: false, reason: "No output to save." };
    if (gradedSubmission == null)
      return { ok: false, reason: "No graded submission context." };
    return { ok: true };
  }

  // 7) Save local
  function handleSaveLocal(): void {
    if (modelsUnavailable) {
      setFeedback(null);
      setOutputMsg("No models available");
    }
    const v = canSave();
    if (!v.ok) {
      setSaveMsg(v.reason);
      return;
    }
    const sub = gradedSubmission as StudentSubmission; // safe due to guard
    const fb = feedback as ProblemFeedbackList; // safe due to guard

    saveSession({
      model,
      systemPrompt: prompt,
      submissionId: sub.id,
      submission: sub,
      feedback: fb,
    });
    setSaveMsg("Saved ✓");
    window.setTimeout(() => setSaveMsg(""), 1500);
  }

  // 8) View rubric
  async function handleViewRubric(nextId?: string): Promise<void> {
    const rid = nextId ?? selectedRubricId;
    if (!rid) return;
    setRubricOpen(true);
    await fetchRubric(rid);
  }

  return (
    <div className="grid grid-cols-12 gap-8 px-4 lg:px-6">
      <div className="col-span-12 xl:col-span-10 space-y-6">
        {/* header + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xl font-semibold">System Prompt</div>
            {loadingPrompt && (
              <div className="text-sm text-gray-500">Loading…</div>
            )}
            {saveMsg && <div className="text-xs text-gray-600">{saveMsg}</div>}
          </div>

          <div className="flex items-center gap-3">
            {/* Model select */}
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <span>Model:</span>
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={modelsLoading || modelsUnavailable}
                  className="h-9 appearance-none rounded-md border border-orange-300 bg-white pl-3 pr-8 text-sm text-gray-800 shadow-sm 
                 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 
                 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {modelsUnavailable ? (
                    <option value="" disabled>
                      No models available
                    </option>
                  ) : (
                    models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))
                  )}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </label>

            {/* Rubric select */}
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <span>Rubric:</span>
              <div className="relative">
                <select
                  value={selectedRubricId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedRubricId(val);
                    handleViewRubric(val);
                  }}
                  onClick={(e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    if (val === selectedRubricId) handleViewRubric(val);
                  }}
                  disabled={rubricIdsLoading || rubricIds.length === 0}
                  className="h-9 appearance-none rounded-md border border-orange-300 bg-white pl-3 pr-8 text-sm text-gray-800 shadow-sm 
                 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 
                 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {rubricIds.length === 0 ? (
                    <option value="" disabled>
                      No rubrics
                    </option>
                  ) : (
                    rubricIds.map((rid) => (
                      <option key={rid} value={rid}>
                        {titleize(rid)}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </label>

            {/* Save local */}
            <button
              onClick={handleSaveLocal}
              className="h-10 rounded-md bg-gray-900 text-white px-4 text-sm hover:opacity-90"
            >
              Save local
            </button>
          </div>
        </div>

        {/* Prompt editor */}
        <PromptEditor
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          sending={sending}
        />

        {/* Output panel */}
        <OutputPanel
          data={feedback}
          message={outputMsg}
          student={gradedSubmission}
        />
      </div>

      {/* Right sidebar: submissions list */}
      <aside className="col-span-12 xl:col-span-2 xl:pr-0">
        <div className="xl:sticky xl:top-16">
          <SubmissionList
            items={listItems}
            total={total}
            page={page}
            pageSize={limit}
            onSelect={(id) => {
              const n = Number(id);
              setSelectedId(Number.isFinite(n) ? n : null);
            }}
            onPageChange={(p) => setPage(p)}
            onView={(id) => {
              const n = Number(id);
              const s = Number.isFinite(n)
                ? subs.find((x) => x.id === n)
                : undefined;
              if (s) {
                setViewerData(s);
                setViewerOpen(true);
              }
            }}
          />
          {loadingSubs && (
            <div className="px-3 py-2 text-xs text-gray-500">
              Loading submissions…
            </div>
          )}
        </div>
      </aside>

      {/* modals */}
      <SubmissionViewer
        open={viewerOpen}
        submission={viewerData}
        onClose={() => setViewerOpen(false)}
      />
      <RubricViewer
        open={rubricOpen}
        onClose={() => setRubricOpen(false)}
        rubric={rubricData}
        rubricId={selectedRubricId}
        loading={rubricLoading}
      />
    </div>
  );
}
