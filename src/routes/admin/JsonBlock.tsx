// src/routes/admin/JsonBlock.tsx
import { useMemo } from "react";

export default function JsonBlock({
  data,
  filename = "submission.json",
}: {
  data: unknown;
  filename?: string;
}) {
  const pretty = useMemo(() => {
    try {
      return JSON.stringify(data ?? {}, null, 2);
    } catch {
      return '"[unserializable data]"';
    }
  }, [data]);

  function copy() {
    void navigator.clipboard.writeText(pretty);
  }
  function download() {
    const blob = new Blob([pretty], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename && filename.trim() ? filename : "submission.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
        <div className="text-sm font-medium text-gray-700">Raw JSON</div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs hover:bg-gray-50"
          >
            Copy
          </button>
          <button
            onClick={download}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs hover:bg-gray-50"
          >
            Download
          </button>
        </div>
      </div>
      <pre className="max-h-[65vh] overflow-auto bg-white p-3 text-[13px] leading-relaxed text-gray-900 whitespace-pre-wrap break-words font-mono">
        {pretty}
      </pre>
    </div>
  );
}
