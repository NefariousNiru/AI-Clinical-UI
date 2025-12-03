// file: src/components/Tabs.tsx

type TabItem = { value: string; label: string };

type TabsProps = {
    value: string;
    onChange: (v: string) => void;
    items: TabItem[];
};

/**
 * Simple controlled tabs.
 *
 * - Parent owns state.
 * - Uses semantic theme utilities.
 * - Accessible: role="tablist"/"tab", aria-selected, tabIndex.
 */
export default function Tabs({ value, onChange, items }: TabsProps) {
    return (
        <div
            className="inline-flex rounded-full border border-subtle bg-surface-subtle overflow-hidden"
            role="tablist"
            aria-label="View mode"
        >
            {items.map((t, index) => {
                const active = value === t.value;
                return (
                    <button
                        key={t.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-controls={`tab-panel-${t.value}`}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onChange(t.value)}
                        className={[
                            "px-3 py-1.5 text-xs font-medium",
                            index > 0 ? "border-l border-subtle" : "",
                            active
                                ? "bg-accent text-on-accent"
                                : "bg-surface-subtle text-muted hover:text-primary hover:bg-surface",
                        ].join(" ")}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
