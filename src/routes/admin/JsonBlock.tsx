// src/routes/admin/JsonBlock.tsx
import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/github.css";

hljs.registerLanguage("json", json);

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

  const lines = useMemo(() => pretty.split("\n"), [pretty]);

  const highlightedLines = useMemo(() => {
    return lines.map((line) => {
      const { value } = hljs.highlight(line, {
        language: "json",
        ignoreIllegals: true,
      });
      return value;
    });
  }, [lines]);

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
      {/* Header */}
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

      {/* Body */}
      <div
        className="bg-white font-mono text-[13px]"
        style={{ maxHeight: "65vh", overflow: "auto" }}
      >
        {/* Sticky gutters make large files nicer to scan */}
        <div className="min-w-full">
          {highlightedLines.map((hl, i) => (
            <div
              key={i}
              className="grid"
              style={{ gridTemplateColumns: "64px 1fr" }}
            >
              {/* Gutter cell (aligned per row) */}
              <div
                className="bg-gray-50 text-gray-400 text-xs text-right pr-3 select-none border-r border-gray-100 sticky left-0"
                style={{ alignSelf: "start", paddingTop: 2, paddingBottom: 2 }}
              >
                {i + 1}
              </div>

              {/* Code cell (wraps; controls row height) */}
              <div className="px-3">
                <code
                  className="hljs"
                  style={{
                    whiteSpace: "pre-wrap", // allow wrapping
                    wordBreak: "break-word", // break long tokens
                    overflowWrap: "anywhere", // fallback for very long strings
                    lineHeight: 1.35,
                    display: "block",
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                  dangerouslySetInnerHTML={{ __html: hl }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
