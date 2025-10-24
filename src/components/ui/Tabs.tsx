// src/components/ui/Tabs.tsx
/*
1) Purpose: Simple controlled tabs for small two-state switches.
2) Usage: <Tabs value={value} onChange={setValue} items={[{value:'a',label:'A'}]} />
3) Behavior: Purely presentational; parent owns state.
4) Styling: Neutral; consistent with existing Tailwind look.
*/
type TabItem = { value: string; label: string };

export default function Tabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: TabItem[];
}) {
  return (
    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
      {items.map((t, i) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={[
              "px-3 py-1.5 text-xs",
              i > 0 ? "border-l border-gray-300" : "",
              active
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
