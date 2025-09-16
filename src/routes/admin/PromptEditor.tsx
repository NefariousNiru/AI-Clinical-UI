// src/routes/admin/PromptEditor.tsx
type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending?: boolean
};

export default function PromptEditor({ value, onChange, onSend, sending }: Props) {
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="p-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or paste the system prompt..."
          className="w-full min-h-[400px] resize-y rounded-md border border-gray-200 bg-gray-50
             p-4 text-base outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="flex items-center justify-between px-3 pb-3">
        <div className="text-[11px] text-gray-500">
          We store the exact prompt used for each run locally on your system. If
          you like a particular prompt, send it over!
        </div>
        <button
          onClick={onSend}
          disabled={!!sending}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white
                     hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
