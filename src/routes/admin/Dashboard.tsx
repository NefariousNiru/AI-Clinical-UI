// src/routes/admin/Dashboard.tsx
import { useState, useMemo, useEffect } from "react"
import PromptEditor from "./PromptEditor"
import OutputPanel from "./OutputPanel"
import SubmissionList from "./SubmissionList"
import SubmissionViewer from "./SubmissionViewer"
import type { StudentSubmission, ProblemFeedbackList } from "../../types/admin"
import { getSystemPrompt, getSubmissions, chat } from "../../services/adminApi"

export default function Dashboard() {
  // UI state
  const [model, setModel] = useState("gpt-5-nano")

  // system prompt
  const [prompt, setPrompt] = useState<string>("")
  const [loadingPrompt, setLoadingPrompt] = useState<boolean>(false)

  // submissions
  const [subs, setSubs] = useState<StudentSubmission[]>([])
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10) // keep 10 per page
  const [total, setTotal] = useState<number>(0)
  const [loadingSubs, setLoadingSubs] = useState<boolean>(false)

  // selection
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // viewer modal
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerData, setViewerData] = useState<StudentSubmission | null>(null)

  // output from /chat (structured)
  const [feedback, setFeedback] = useState<ProblemFeedbackList | null>(null)
  const [outputMsg, setOutputMsg] = useState<string>("")
  const [sending, setSending] = useState<boolean>(false)

  // helpers
  function errMsg(e: unknown): string {
    if (e instanceof Error) return e.message
    if (typeof e === "string") return e
    return "Request failed"
  }

  // 1) load system prompt once
  useEffect(() => {
    let active = true
    setLoadingPrompt(true)
    getSystemPrompt()
      .then((r) => {
        if (active) setPrompt(r.systemPrompt)
      })
      .catch((e) => {
        console.error("System prompt load failed:", e)
        if (active) setPrompt("(failed to load system prompt)")
      })
      .finally(() => active && setLoadingPrompt(false))
    return () => {
      active = false
    }
  }, [])

  // 2) load submissions whenever page changes
  useEffect(() => {
    let active = true
    setLoadingSubs(true)
    getSubmissions({ page, limit })
      .then((resp) => {
        if (!active) return
        setSubs(resp.items)
        setTotal(resp.total)
        // clear selection if the selected id is not on this page
        if (selectedId && !resp.items.some((s) => s.id === selectedId)) {
          setSelectedId(null)
        }
      })
      .catch((e) => {
        console.error("Submissions load failed:", e)
        if (active) {
          setSubs([])
          setTotal(0)
        }
      })
      .finally(() => active && setLoadingSubs(false))
    return () => {
      active = false
    }
    // NOTE: we intentionally do NOT depend on selectedId to avoid refetching when selecting
  }, [page, limit])

  // list rows expected by SubmissionList (id/title/subtitle)
  const listItems = useMemo(
    () =>
      subs.map((s) => ({
        id: s.id,
        title: `Submission #${s.id}`,
        subtitle: s.synthetic ? "Synthetic" : "Student",
      })),
    [subs]
  )

  // 3) send to /chat using current prompt and selected submission
  async function handleSend() {
    const sub = selectedId != null ? subs.find((s) => s.id === selectedId) : undefined
    if (!sub) {
      setFeedback(null)
      setOutputMsg("Select a submission from the list on the right, then press Send.")
      return
    }

    setSending(true)
    setFeedback(null)
    setOutputMsg("Processing…")
    try {
      const resp = await chat({
        studentSubmission: sub,
        systemPrompt: prompt,
        modelProvider: "openai",
        modelName: model,
      })
      setFeedback(resp)   // structured data
      setOutputMsg("")    // clear message
    } catch (e: unknown) {
      setFeedback(null)
      setOutputMsg(errMsg(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-8 px-4 lg:px-6">
      <div className="col-span-12 xl:col-span-9 space-y-6">
        {/* header + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xl font-semibold">System Prompt</div>
            {loadingPrompt && <div className="text-sm text-gray-500">Loading…</div>}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 font-semibold">Model:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-base"
            >
              <option>gpt-5-nano</option>
              <option>gpt-5-mini</option>
              <option>gpt-5</option>
              <option>gpt-4.1</option>
              <option>gpt-4o-mini</option>
            </select>

            <a
              href="mailto:nirupomboseroy@uga.edu?cc=rpalmer@uga.edu"
              className="h-10 inline-flex items-center rounded-md bg-orange-200 text-black px-4 text-sm hover:opacity-90"
            >
              Complaints&nbsp;?
            </a>

            <button className="h-10 rounded-md bg-gray-200 text-black px-4 text-sm hover:opacity-90">
              Save local
            </button>

            <button className="h-10 rounded-md bg-gray-900 text-white px-4 text-sm hover:opacity-90">
              Revert to default prompt
            </button>
          </div>
        </div>

        {/* Prompt editor */}
        <PromptEditor value={prompt} onChange={setPrompt} onSend={handleSend} sending={sending} />

        {/* Output panel */}
        <OutputPanel data={feedback} message={outputMsg} />
      </div>

      {/* Right sidebar flush to the edge. On tall screens it stays in view. */}
      <aside className="col-span-12 xl:col-span-3 xl:pr-0">
        <div className="xl:sticky xl:top-16">
          <SubmissionList
            items={listItems}
            total={total}
            page={page}
            pageSize={limit}
            onSelect={(id) => setSelectedId(Number(id))}
            onPageChange={(p) => setPage(p)}
            onView={(id) => {
              const s = subs.find((x) => x.id === Number(id))
              if (s) {
                setViewerData(s)
                setViewerOpen(true)
              }
            }}
          />
          {loadingSubs && <div className="px-3 py-2 text-xs text-gray-500">Loading submissions…</div>}
        </div>
      </aside>

      {/* modal */}
      <SubmissionViewer open={viewerOpen} submission={viewerData} onClose={() => setViewerOpen(false)} />
    </div>
  )
}
