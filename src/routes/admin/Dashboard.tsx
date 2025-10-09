// src/routes/admin/Dashboard.tsx
import { useState, useMemo, useEffect } from "react";
import PromptEditor from "./PromptEditor";
import OutputPanel from "./OutputPanel";
import SubmissionList from "./SubmissionList";
import SubmissionViewer from "./SubmissionViewer";
import type { StudentSubmission, ProblemFeedbackList } from "../../types/admin";
import {
  getSystemPrompt,
  getSubmissions,
  chat,
  getAvailableModels,
  getAvailableRubrics,
  getRubric,
} from "../../services/adminApi";
import { saveSession } from "../../lib/localSession";
import type { RubricPayload } from "../../types/rubric";
import { titleize } from "../../lib/functions";
import RubricViewer from "./RubricViewer";

// type-safe runtime guards
const isString = (v: unknown): v is string => typeof v === "string";
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(isString);
const isSubmissionArray = (v: unknown): v is StudentSubmission[] =>
  Array.isArray(v) &&
  v.every((s) => s && typeof (s as StudentSubmission).id === "number");
const hasSystemPrompt = (v: unknown): v is { systemPrompt?: string | null } =>
  typeof v === "object" && v !== null && "systemPrompt" in v;

export default function Dashboard() {
  // UI state
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const modelsUnavailable = models.length === 0;

  // system prompt
  const [prompt, setPrompt] = useState<string>("");
  const [loadingPrompt, setLoadingPrompt] = useState<boolean>(false);

  // submissions
  const [subs, setSubs] = useState<StudentSubmission[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10); // keep 10 per page
  const [total, setTotal] = useState<number>(0);
  const [loadingSubs, setLoadingSubs] = useState<boolean>(false);

  // selection
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // viewer modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerData, setViewerData] = useState<StudentSubmission | null>(null);

  // output from /chat (structured)
  const [feedback, setFeedback] = useState<ProblemFeedbackList | null>(null);
  const [outputMsg, setOutputMsg] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  // save status message - local save
  const [saveMsg, setSaveMsg] = useState<string>("");

  // rubric state
  const [rubricIds, setRubricIds] = useState<string[]>([]);
  const [rubricIdsLoading, setRubricIdsLoading] = useState(false);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [rubricOpen, setRubricOpen] = useState(false);
  const [rubricLoading, setRubricLoading] = useState(false);
  const [rubricData, setRubricData] = useState<RubricPayload | null>(null);

  // 1) load system prompt once
  useEffect(() => {
    let active = true;
    setLoadingPrompt(true);
    getSystemPrompt()
      .then((r) => {
        if (!active) return;
        const sp =
          hasSystemPrompt(r) && isString(r.systemPrompt) ? r.systemPrompt : "";
        setPrompt(sp);
      })
      .catch((e) => {
        console.error("System prompt load failed:", e);
        if (active) setPrompt("(failed to load system prompt)");
      })
      .finally(() => active && setLoadingPrompt(false));
    return () => {
      active = false;
    };
  }, []);

  // 2) load submissions whenever page changes
  useEffect(() => {
    let active = true;
    setLoadingSubs(true);
    getSubmissions({ page, limit })
      .then((resp) => {
        if (!active) return;
        const items = isSubmissionArray(
          (resp as unknown as { items?: unknown })?.items
        )
          ? (resp as { items: StudentSubmission[] }).items
          : [];
        const totalVal = (resp as unknown as { total?: unknown })?.total;
        const total =
          typeof totalVal === "number" && Number.isFinite(totalVal)
            ? totalVal
            : 0;
        setSubs(items);
        setTotal(total);
        // clear selection if the selected id is not on this page
        if (selectedId != null && !items.some((s) => s.id === selectedId)) {
          setSelectedId(null);
        }
      })
      .catch((e) => {
        console.error("Submissions load failed:", e);
        if (active) {
          setSubs([]);
          setTotal(0);
        }
      })
      .finally(() => active && setLoadingSubs(false));
    return () => {
      active = false;
    };
    // NOTE: we intentionally do NOT depend on selectedId to avoid refetching when selecting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // 3) load available models once
  useEffect(() => {
    let active = true;
    setModelsLoading(true);
    getAvailableModels()
      .then((list) => {
        if (!active) return;
        const arr = isStringArray(list) ? list : [];
        setModels(arr);
        setModel(arr[0] ?? "");
      })
      .catch((e) => {
        console.error("Available models load failed:", e);
        if (active) setModels([]); // fallback: only "default" will be shown
      })
      .finally(() => active && setModelsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // 4) load rubric ids once
  useEffect(() => {
    let active = true;
    setRubricIdsLoading(true);
    getAvailableRubrics()
      .then((ids) => {
        if (!active) return;
        const arr = Array.isArray(ids) ? ids : [];
        setRubricIds(arr);
        setSelectedRubricId(arr[0] ?? "");
      })
      .catch((e) => {
        console.error("Available rubrics load failed:", e);
        if (active) setRubricIds([]);
      })
      .finally(() => active && setRubricIdsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // list rows expected by SubmissionList (id/title/subtitle)
  const listItems = useMemo(
    () =>
      subs.map((s) => ({
        id: s.id,
        title: `Submission #${s.id}`,
        subtitle: s.synthetic ? "Synthetic" : "Student",
      })),
    [subs]
  );

  // select -> selected Submission using id
  const selectedSubmission = useMemo<StudentSubmission | null>(() => {
    if (selectedId == null) return null;
    return subs.find((s) => s.id === selectedId) ?? null;
  }, [subs, selectedId]);

  // 1) send to /chat using current prompt and selected submission
  async function handleSend() {
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
    try {
      const resp = await chat({
        studentSubmission: sub,
        systemPrompt: prompt,
        modelName: model,
      });
      setFeedback(resp); // structured data
      setOutputMsg(""); // clear message
    } catch (e: unknown) {
      setFeedback(null);
      setOutputMsg(errMsg(e));
    } finally {
      setSending(false);
    }
  }

  // 2) local save check
  function canSave(): { ok: boolean; reason?: string } {
    if (!(prompt || "").trim())
      return { ok: false, reason: "System prompt is empty." };
    if (selectedId == null)
      return { ok: false, reason: "No submission selected." };
    // we saved chat output as structured list; if you still use string JSON, adjust this check
    if (!Array.isArray(feedback) || feedback.length === 0)
      return { ok: false, reason: "No output to save." };
    return { ok: true };
  }

  // 3) local save action
  function handleSaveLocal() {
    if (modelsUnavailable) {
      setFeedback(null);
      setOutputMsg("No models available");
    }
    const v = canSave();
    if (!v.ok) {
      setSaveMsg(v.reason || "Invalid state");
      return;
    }
    const sub = subs.find((s) => s.id === selectedId)!;
    saveSession({
      model,
      systemPrompt: prompt,
      submissionId: sub.id,
      submission: sub,
      feedback: feedback as ProblemFeedbackList,
    });
    setSaveMsg("Saved ✓");
    setTimeout(() => setSaveMsg(""), 1500);
  }

  // 4) view rubric action
  async function handleViewRubric() {
    if (!selectedRubricId) return;
    setRubricOpen(true);
    setRubricLoading(true);
    setRubricData(null);
    try {
      const r = await getRubric(selectedRubricId);
      console.log(r)
      setRubricData(r as RubricPayload);
    } catch (e) {
      console.error("Rubric fetch failed:", e);
      setRubricData(null);
    } finally {
      setRubricLoading(false);
    }
  }

  // helper functions
  function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "Request failed";
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

                {/* Custom arrow */}
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

            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <span>Rubric:</span>
              <div className="relative">
                <select
                  value={selectedRubricId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedRubricId(val);
                    handleViewRubric();
                  }}
                  onClick={(e) => {
                    // if the same rubric is reselected, force re-fetch
                    const val = (e.target as HTMLSelectElement).value;
                    if (val === selectedRubricId) {
                      handleViewRubric();
                    }
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

                {/* Custom arrow */}
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

            {/* Save local button */}
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
          student={selectedSubmission}
        />
      </div>

      {/* Right sidebar flush to the edge. On tall screens it stays in view. */}
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

      {/* modal */}
      <SubmissionViewer
        open={viewerOpen}
        submission={viewerData}
        onClose={() => setViewerOpen(false)}
      />

      {/* ✅ rubric modal */}
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
