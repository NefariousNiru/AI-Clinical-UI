// file: src/pages/admin/tests/SubmissionList.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { titleizeDiseaseName } from "../../../lib/utils/functions.ts";

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
	const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 1;
	const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
	const totalPages = Math.max(1, Math.ceil(safeTotal / safePageSize));

	return (
		<div className="rounded-3xl border border-subtle">
			<div className="border-b border-subtle px-4 py-3 text-sm font-medium">
				Student Submissions
			</div>

			<div className="max-h-[75vh] overflow-auto">
				{(Array.isArray(items) ? items : []).map((it, idx) => {
					const sid = it?.id ?? null;
					const active = selected === it.id;
					return (
						<div
							key={String(sid ?? idx)}
							className={[
								"row-item flex items-center justify-between px-4 py-3.5 border-b border-subtle",
								active ? "bg-accent-soft is-active" : "btn-hover",
							].join(" ")}
						>
							{/* click anywhere on the left to select */}
							<button
								onClick={() => {
									setSelected(it.id);
									onSelect(it.id);
								}}
								className="min-w-0 flex-1 text-left"
							>
								<div className="text-sm font-medium">
									{(it.title ?? "").trim() || "(untitled)"}
								</div>
								{typeof it.subtitle === "string" && it.subtitle.trim() && (
									<div className="truncate text-xs text-muted">
										{titleizeDiseaseName(it.subtitle)}
									</div>
								)}
							</button>

							{/* View button */}
							<button
								onClick={(e) => {
									e.stopPropagation();
									if (sid == null) return;
									onView(it.id);
								}}
								className="ml-3 h-8 shrink-0 rounded-md border border-strong app-bg px-2 text-xs btn-hover"
							>
								View
							</button>
						</div>
					);
				})}
			</div>

			{/* pagination */}
			<div className="flex items-center justify-between gap-2 px-3 py-2">
				<div className="text-xs text-accent">
					Page {page} of {totalPages}
				</div>
				<div className="flex items-center gap-2">
					<button
						disabled={page <= 1}
						onClick={() => onPageChange(page - 1)}
						className="h-8 inline-flex items-center gap-1 rounded-md border btn-hover border-strong app-bg px-2 text-xs disabled:opacity-50"
					>
						<ChevronLeft className="h-3 w-3" />
						<span>Prev</span>
					</button>

					<button
						disabled={page >= totalPages}
						onClick={() => onPageChange(page + 1)}
						className="h-8 inline-flex items-center gap-1 rounded-md border btn-hover border-strong app-bg px-2 text-xs disabled:opacity-50"
					>
						<span>Next</span>
						<ChevronRight className="h-3 w-3" />
					</button>
				</div>
			</div>
		</div>
	);
}
