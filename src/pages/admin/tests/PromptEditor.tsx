// file: src/pages/admin/tests/PromptEditor.tsx

import {Send} from "lucide-react";

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
            aria-labelledby="system-prompt-editor-title"
            className="relative rounded-3xl border border-subtle bg-surface-subtle shadow-sm overflow-hidden focus-within:border-strong"
        >
        <textarea
            id="system-prompt-editor"
            value={value ?? ""}
            onChange={(ev) => onChange(ev.target.value)}
            placeholder="Type or paste the system prompt..."
            className="
                textarea-scroll
                w-full
                min-h-[500px]
                resize-y
                border-none
                bg-transparent
                p-4
                pr-28      /* space for button on the right */
                pb-16      /* space for button at the bottom */
                text-sm
                md:text-base
                focus:outline-none
                focus-visible:outline-none
            "
            aria-describedby={helpTextId}
        />

            <button
                type="button"
                onClick={onSend}
                disabled={sending}
                className="
                absolute
                bottom-4
                right-4
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-full
                bg-accent
                px-3 py-2          /* tighter on mobile */
                sm:px-6 sm:py-2    /* larger on bigger screens */
                text-sm
                font-medium
                text-on-accent
                shadow-sm
                transition-opacity
                hover:opacity-90
                disabled:opacity-60
            "
                aria-label="Send prompt and grade current submission"
                aria-busy={sending}
            >
                <Send className="h-4 w-4" aria-hidden="true"/>
                <span className="hidden sm:inline">
                    {sending ? "Sending…" : "Send"}
                </span>
            </button>
        </section>
    );
}
