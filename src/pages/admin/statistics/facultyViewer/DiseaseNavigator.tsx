// file: src/pages/admin/statistics/facultyViewer/DiseaseNavigator.tsx

interface Props {
	label: string;
	current: number; // 0-based
	total: number;
	onPrev: () => void;
	onNext: () => void;
}

export default function DiseaseNavigator({ label, current, total, onPrev, onNext }: Props) {
	return (
		<div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-subtle bg-surface mb-3">
			<button
				onClick={onPrev}
				disabled={current === 0}
				className="w-8 h-8 flex items-center justify-center rounded-md border border-strong bg-surface-subtle text-primary text-sm disabled:opacity-25 disabled:cursor-default hover:bg-surface transition-colors"
				aria-label="Previous disease"
			>
				←
			</button>

			<span className="flex-1 text-base font-medium tracking-tight text-primary truncate">
				{label}
			</span>

			<span className="text-xs text-muted font-mono whitespace-nowrap">
				{current + 1} / {total}
			</span>

			<button
				onClick={onNext}
				disabled={current === total - 1}
				className="w-8 h-8 flex items-center justify-center rounded-md border border-strong bg-surface-subtle text-primary text-sm disabled:opacity-25 disabled:cursor-default hover:bg-surface transition-colors"
				aria-label="Next disease"
			>
				→
			</button>
		</div>
	);
}
