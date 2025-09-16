import { useState, useMemo } from "react";
import PromptEditor from "./PromptEditor";
import OutputPanel from "./OutputPanel";
import SubmissionList from "./SubmissionList";
import type { StudentSubmission } from "./SubmissionViewer";
import SubmissionViewer from "./SubmissionViewer";

export default function Dashboard() {
  // temp local state to simulate load/save/preview
  const [model, setModel] = useState("Claude 3.7");
  const [prompt, setPrompt] = useState(
    "Evaluate the student's gout case workup focusing on diagnostic accuracy, treatment appropriateness, and patient counseling points. Provide specific, actionable feedback for improvement based on their demonstrated competency level."
  );
  const [output, setOutput] = useState<string>("");
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerData, setViewerData] = useState<StudentSubmission | null>(null)
  

  // submissions: pretend we fetched a page
  const mockSubmissions = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        title: `Submission #${i + 1}`,
        subtitle: [
          "Strong Diagnostic Reasoning",
          "Adequate Assessment - Minor Gaps",
          "Incomplete Workup - Missing Labs",
          "Comprehensive Treatment Plan",
          "Basic Treatment Approach",
          "Detailed Medication Counseling",
          "Monitoring Plan with Follow-up",
          "Drug Interaction Assessment",
        ][i],
      })),
    []
  );

  return (
    <div className="grid grid-cols-12 gap-8 px-4 lg:px-6">
      <div className="col-span-12 xl:col-span-9 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xl">System Prompt</div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 font-semibold">Model:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-base"
            >
              <option>Claude 3.7</option>
              <option>Claude 3.5 Sonnet</option>
              <option>GPT-4.1</option>
            </select>

            <button className="h-10 rounded-md bg-orange-200 text-black px-4 text-sm hover:opacity-90">
              Complaints&nbsp;?
            </button>

            <button className="h-10 rounded-md bg-gray-200 text-black px-4 text-sm hover:opacity-90">
              Save local
            </button>

            <button className="h-10 rounded-md bg-gray-900 text-white px-4 text-sm hover:opacity-90">
              Revert to default prompt
            </button>
          </div>
        </div>

        {/* Prompt editor */}
        <PromptEditor
          value={prompt}
          onChange={setPrompt}
          onSend={() => {
            // simple fake "processing"
            setOutput("Output will appear here after processing...");
            setTimeout(() => {
              setOutput(
                "🧪 (mock) Generated feedback:\n- Diagnosis addresses gout flare\n- Treatment plan mentions ULT target < 360 µmol/L\n- Add counseling on alcohol and red meat moderation"
              );
            }, 600);
          }}
        />

        {/* Output panel */}
        <OutputPanel value={output} />
      </div>

      {/* Right sidebar flush to the edge. On tall screens it stays in view. */}
      <aside className="col-span-12 xl:col-span-3 xl:pr-0">
        <div className="xl:sticky xl:top-16">
          <SubmissionList
            items={mockSubmissions}
            total={42}
            page={1}
            pageSize={8}
            onSelect={(id) => console.log("selected submission", id)}
            onPageChange={(p) => console.log("page ->", p)}
            onView={(id) => {
              // TODO replace with real fetch(`/admin/submissions/${id}`)
              const mock: StudentSubmission = {
                id: Number(id),
                synthetic: false,
                problems: [
                  { name: "gout_flare", isPriority: true, identification: "…", explanation: "…", planRecommendation: "…", monitoring: "…" }
                ]
              }
              setViewerData(mock)
              setViewerOpen(true)
            }}
          />
        </div>
      </aside>
      {/* modal */}
      <SubmissionViewer
        open={viewerOpen}
        submission={viewerData}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
