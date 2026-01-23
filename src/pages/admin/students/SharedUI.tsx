// file: src/pages/admin/students/SharedUI.tsx

import type { Semester } from "../../../lib/types/semester.ts";

/* ----------------- shared styles ----------------- */

export const btnBase = [
	"inline-flex items-center justify-center",
	"px-3 py-2 text-xs font-semibold",
	"transition-all select-none",
	"shadow-sm",
	"hover:opacity-80 hover:shadow",
	"active:translate-y-[1px]",
].join(" ");

export const btnPrimary = [btnBase, "rounded-xl bg-accent text-on-accent"].join(" ");

export const btnSecondary = [
	btnBase,
	"border border-subtle bg-input text-primary rounded-3xl",
	"hover:bg-surface-subtle",
].join(" ");

export const btnSecondaryAccent = [
	btnBase,
	"bg-secondary text-on-secondary rounded-3xl",
	"border border-secondary",
].join(" ");

/* ----------------- shared components ----------------- */

export function InlineNotice({
	tone,
	text,
}: {
	tone: "danger" | "info" | "success";
	text: string;
}) {
	const cls =
		tone === "danger"
			? "bg-danger-soft text-danger border border-danger"
			: tone === "success"
				? "bg-secondary-soft-alt text-secondary border border-secondary"
				: "bg-surface-subtle text-muted border border-subtle";

	return <div className={["rounded-2xl px-3 py-2 text-xs border", cls].join(" ")}>{text}</div>;
}

export function ActionChip({
	label,
	mobileLabel,
	onClick,
	disabled,
	tone = "default",
	title,
	ariaLabel,
}: {
	label: string;
	mobileLabel: string;
	onClick: () => void;
	disabled: boolean;
	tone?: "default" | "danger";
	title?: string;
	ariaLabel: string;
}) {
	const base =
		tone === "danger"
			? "bg-danger-soft text-danger border border-danger"
			: "bg-surface-subtle text-primary border border-subtle";

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			aria-label={ariaLabel}
			className={[
				"rounded-full px-3 py-2 text-[11px] font-semibold border",
				"transition-all shadow-sm hover:shadow hover:opacity-80 active:translate-y-[1px]",
				"disabled:opacity-60 disabled:cursor-not-allowed",
				base,
			].join(" ")}
		>
			<span className="hidden sm:inline">{label}</span>
			<span className="sm:hidden">{mobileLabel}</span>
		</button>
	);
}

export function SemesterModeBadge({ semester }: { semester: Semester | null }) {
	return (
		<span
			className={[
				"shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
				!semester
					? "bg-surface-subtle text-muted border-subtle"
					: semester.isCurrent
						? "bg-secondary-soft-alt text-secondary border-secondary"
						: "bg-surface-subtle text-muted border-subtle",
			].join(" ")}
			title="Only current semester can be edited"
		>
			{semester?.isCurrent ? "Current" : "View only"}
		</span>
	);
}
