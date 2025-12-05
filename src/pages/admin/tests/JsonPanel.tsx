// file: src/pages/admin/tests/JsonPanel.tsx

import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/atom-one-dark-reasonable.css";

hljs.registerLanguage("json", json);

type JsonPanelProps = {
    data: unknown;
    filename?: string;
};

/**
 * Read-only JSON viewer with:
 * - Syntax highlighting (highlight.js).
 * - Line numbers.
 * - Copy + Download actions.
 * - Theme tokens for container styling.
 */
export default function JsonPanel({
                                         data,
                                         filename = "submission.json",
                                     }: JsonPanelProps) {
    const pretty = useMemo(() => {
        try {
            return JSON.stringify(data ?? {}, null, 2);
        } catch {
            return '"[unserializable data]"';
        }
    }, [data]);

    const lines = useMemo(() => pretty.split("\n"), [pretty]);

    const highlightedLines = useMemo(
        () =>
            lines.map((line) => {
                const { value } = hljs.highlight(line, {
                    language: "json",
                    ignoreIllegals: true,
                });
                return value;
            }),
        [lines],
    );

    function handleCopy(): void {
        void navigator.clipboard.writeText(pretty);
    }

    function handleDownload(): void {
        const blob = new Blob([pretty], {
            type: "application/json;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename.trim() || "submission.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <section
            className="rounded-lg border border-subtle bg-surface overflow-hidden"
            aria-label="Raw JSON view"
        >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-subtle bg-surface-subtle px-3 py-2">
                <div className="text-sm font-medium text-primary">Raw JSON</div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="h-8 rounded-md border border-subtle bg-surface-subtle px-2 text-xs text-primary hover:bg-surface"
                        aria-label="Copy JSON to clipboard"
                    >
                        Copy
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="h-8 rounded-md border border-subtle bg-surface-subtle px-2 text-xs text-primary hover:bg-surface"
                        aria-label={`Download JSON as ${filename}`}
                    >
                        Download
                    </button>
                </div>
            </header>

            {/* Body */}
            <div
                className="bg-surface font-mono text-[13px]"
                style={{ maxHeight: "65vh", overflow: "auto" }}
            >
                <div className="min-w-full">
                    {highlightedLines.map((hl, i) => (
                        <div
                            key={i}
                            className="grid"
                            style={{ gridTemplateColumns: "64px 1fr" }}
                        >
                            {/* Line number gutter */}
                            <div
                                className="sticky left-0 select-none border-r border-subtle bg-surface-subtle pr-3 text-right text-xs text-muted"
                                style={{ alignSelf: "start", paddingTop: 2, paddingBottom: 2 }}
                            >
                                {i + 1}
                            </div>

                            {/* Code cell */}
                            <div className="px-3">
                                <code
                                    className="hljs"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        overflowWrap: "anywhere",
                                        lineHeight: 1.35,
                                        display: "block",
                                        paddingTop: 2,
                                        paddingBottom: 2,
                                    }}
                                    // highlight.js output is trusted HTML
                                    dangerouslySetInnerHTML={{ __html: hl }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
