// file: src/pages/student/forms/FormField.tsx

import type { ChangeEvent } from "react";

export type TextLimit = "xSmall" | "small" | "large" | "medium";

type Props = {
	label: string;
	value?: string;
	onChange: (next?: string) => void;

	placeholder?: string;
	multiline?: boolean;
	className?: string;

	// Optional validation/counter
	limit?: TextLimit; // "small" => 600, "large" => 4000
	maxChars?: number; // overrides limit if provided
	showCounter?: boolean; // only shows if max is present
	enforceMax?: boolean; // if true, trims input to max before calling onChange

	hideLabel?: boolean;
};

const LIMITS: Record<TextLimit, number> = {
	xSmall: 25,
	small: 100,
	medium: 600,
	large: 4000,
};

export default function FormField({
	label,
	value,
	onChange,
	placeholder,
	multiline,
	className = "",

	limit,
	maxChars,
	showCounter,
	enforceMax = true,

	hideLabel = false,
}: Props) {
	const v = value ?? "";

	const resolvedMax = maxChars ?? (limit ? LIMITS[limit] : undefined);
	const shouldShowCounter = Boolean(showCounter && resolvedMax);

	const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		let raw = e.target.value;
		if (resolvedMax && enforceMax && raw.length > resolvedMax) {
			raw = raw.slice(0, resolvedMax);
		}
		const next = raw.trim().length === 0 ? undefined : raw;
		onChange(next);
	};

	const base = "w-full rounded-lg border border-subtle bg-surface-subtle px-3 py-2 text-primary";

	const counterText = resolvedMax ? `${v.length}/${resolvedMax}` : "";

	return (
		<label className={["flex flex-col gap-1", className].join(" ")}>
			<span className={hideLabel ? "sr-only" : "text-primary text-xs font-medium"}>
				{label}
			</span>

			{multiline ? (
				<div className="relative">
					<textarea
						className={[
							base,
							shouldShowCounter ? "pb-7" : "",
							"min-h-[88px] resize-y",
						].join(" ")}
						value={v}
						onChange={handle}
						placeholder={placeholder}
						aria-invalid={resolvedMax ? v.length > resolvedMax : undefined}
					/>
					{shouldShowCounter ? (
						<div className="pointer-events-none absolute right-5 bottom-2 text-[11px] text-muted">
							{counterText}
						</div>
					) : null}
				</div>
			) : (
				<div className="flex flex-col gap-1">
					<input
						className={base}
						value={v}
						onChange={handle}
						placeholder={placeholder}
						aria-invalid={resolvedMax ? v.length > resolvedMax : undefined}
					/>
					{shouldShowCounter ? (
						<div className="text-[11px] text-muted">{counterText}</div>
					) : null}
				</div>
			)}
		</label>
	);
}
