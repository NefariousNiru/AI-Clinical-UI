// file: src/components/Tabs.tsx

type TabItem = { value: string; label: string };

type TabsProps = {
    value: string;
    onChange: (v: string) => void;
    items: TabItem[];
    /**
     * When true, tabs stretch to fill width on small screens,
     * but revert to compact inline pill on md+.
     */
    fullWidth?: boolean;
};

export default function Tabs({
                                 value,
                                 onChange,
                                 items,
                                 fullWidth = false,
                             }: TabsProps) {
    const rootClass = [
        "rounded-full border border-subtle overflow-hidden bg-surface-subtle",
        fullWidth
            ? "flex w-full md:inline-flex md:w-auto"
            : "inline-flex",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={rootClass} role="tablist" aria-label="View mode">
            {items.map((t, index) => {
                const active = value === t.value;

                const sizeLayoutClasses = fullWidth
                    ? "flex-1 py-1.5 text-xs font-medium text-center md:flex-none md:px-3"
                    : "px-3 py-1.5 text-xs font-medium";

                const borderClass =
                    index > 0 ? "border-l border-subtle" : "";

                const stateClass = active
                    ? "bg-accent text-on-accent"
                    : "bg-surface-subtle text-muted hover:text-primary hover:bg-surface";

                const buttonClass = [
                    sizeLayoutClasses,
                    borderClass,
                    stateClass,
                ]
                    .filter(Boolean)
                    .join(" ");

                return (
                    <button
                        key={t.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-controls={`tab-panel-${t.value}`}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onChange(t.value)}
                        className={buttonClass}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
