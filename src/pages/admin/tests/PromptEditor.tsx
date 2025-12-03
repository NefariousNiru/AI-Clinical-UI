// file: src/pages/admin/tests/PromptEditor.tsx

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    sending?: boolean;
};

export default function PromptEditor({
                                         value,
                                         onChange,
                                         onSend,
                                         sending = false,
                                     }: Props) {
    const helpTextId = "system-prompt-help";

    return (
        <section
            className="rounded-lg border border-subtle shadow-sm"
            aria-labelledby="system-prompt-editor-title"
        >
            <div className="p-3 space-y-2">
                <textarea
                    id="system-prompt-editor"
                    value={value ?? ""}
                    onChange={(ev) => onChange(ev.target.value)}
                    placeholder="Type or paste the system prompt..."
                    className="w-full min-h-[400px] resize-y rounded-md border border-subtle bg-surface p-4 text-sm md:text-base"
                    aria-describedby={helpTextId}
                />
            </div>

            <div className="flex flex-col gap-3 px-3 pb-3 md:flex-row md:items-center md:justify-between">
                <p className="text-[12px] text-muted md:max-w-xl">
                    We store the exact <b>“Prompt + Submission + Model + Output”</b>{" "}
                    for each run locally on your system when you click{" "}
                    <b>“Save local”</b>. If you like a particular prompt, you can
                    share it with the course team.
                </p>

                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onSend}
                        disabled={sending}
                        className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-60"
                        aria-label="Send prompt and grade current submission"
                        aria-busy={sending}
                    >
                        {sending ? "Sending…" : "Send"}
                    </button>
                </div>
            </div>
        </section>
    );
}
