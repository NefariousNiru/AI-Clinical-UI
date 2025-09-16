// src/routes/admin/SubmissionList.tsx
import { useState } from "react";

type Item = { id: number | string; title: string; subtitle?: string };

type Props = {
  items: Item[];
  total: number;
  page: number;
  pageSize: number;
  onSelect: (id: Item["id"]) => void;
  onPageChange: (page: number) => void;
  onView: (id: Item["id"]) => void;
};

export default function SubmissionList({
  items,
  total,
  page,
  pageSize,
  onSelect,
  onPageChange,
  onView,
}: Props) {
  const [selected, setSelected] = useState<Item["id"] | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 px-4 py-2 text-sm font-medium">
        Student Submissions
      </div>

      <div className="max-h-[75vh] overflow-auto">
        {items.map((it) => {
          const active = selected === it.id;
          return (
            <div
              key={it.id}
              className={[
                "flex items-center justify-between px-4 py-3.5 border-b border-gray-100",
                active ? "bg-gray-900/5" : "hover:bg-gray-50",
              ].join(" ")}
            >
              {/* click anywhere on the left to select */}
              <button
                onClick={() => {
                  setSelected(it.id);
                  onSelect(it.id);
                }}
                className="text-left flex-1"
              >
                <div className="text-sm font-medium">{it.title}</div>
                {it.subtitle && (
                  <div className="truncate text-xs text-gray-500">
                    {it.subtitle}
                  </div>
                )}
              </button>

              {/* View button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(it.id);
                }}
                className="ml-3 h-8 shrink-0 rounded-md border border-gray-300 bg-white px-2 text-xs hover:bg-gray-50"
              >
                View
              </button>
            </div>
          );
        })}
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="text-xs text-gray-500">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
