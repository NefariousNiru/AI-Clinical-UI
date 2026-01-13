// file: src/pages/student/submission/edit/mrpTool/MrpToolScaffold.tsx

import type { ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Ellipsis, Save } from "lucide-react";
import FormField from "../../../forms/FormField.tsx";
import { BackToWeeklyWorkup } from "../../BackToWeeklyWorkup.tsx";
import type { SaveOptions } from "../../../hooks/useStudentSubmissionEditor.ts";

type Props = {
	step: number;
	stepsTotal: number;
	completedCount: number;
	longTitle: string;

	// stepper
	stepItems: Array<{ step: number; shortTitle: string; isComplete: boolean; isLocked: boolean }>;
	onStepClick?: (step: number) => void;

	// side panel
	guidanceText: string;
	reflectionQuestions: Record<string, string>;
	reflectionAnswers: Record<string, string>;
	onReflectionAnswerChange: (key: string, value: string) => void;

	// body
	children: ReactNode;

	// actions
	saving: boolean;
	isDirty: boolean;
	canGoNext: boolean;
	onPrev: () => void;
	onNext: () => void;
	onSave: (opts: SaveOptions) => void;

	downloading?: boolean;
	onDownload?: () => Promise<void>;
};

function StepNode({
	n,
	title,
	active,
	complete,
	locked,
	onClick,
	className,
}: {
	n: number;
	title: string;
	active: boolean;
	complete: boolean;
	locked: boolean;
	onClick?: () => void;
	className?: string;
}) {
	const fontStyle = "text-xs text-primary " + (active ? "font-medium" : "font-light");

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={locked}
			aria-current={active ? "step" : undefined}
			aria-disabled={locked ? "true" : undefined}
			className={[
				// make it fill the grid cell
				"w-full",
				// layout
				"flex flex-col items-center gap-1 px-3 py-3 rounded-xl",
				// visuals
				active
					? "border border-secondary bg-secondary-soft-alt"
					: "border border-transparent",
				locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
				className ?? "",
			].join(" ")}
		>
			{/* Circle */}
			<div
				className={[
					"h-4 w-4 rounded-full flex items-center justify-center",
					complete
						? "bg-secondary text-on-secondary"
						: active
							? "border border-secondary text-secondary bg-surface-subtle"
							: "border border-subtle text-muted bg-surface-subtle",
				].join(" ")}
				aria-label={complete ? `Step ${n} completed` : `Step ${n}`}
			>
				{complete ? (
					<Check size={10} aria-hidden="true" />
				) : (
					<Ellipsis size={10} aria-hidden="true" />
				)}
			</div>
			<div className={fontStyle}>{`Step ${n}`}</div>
			<div className={fontStyle}>{title}</div>
		</button>
	);
}

export default function MrpToolScaffold(props: Props) {
	const {
		step,
		stepsTotal,
		completedCount,
		longTitle,
		stepItems,
		onStepClick,
		guidanceText,
		reflectionQuestions,
		reflectionAnswers,
		onReflectionAnswerChange,
		children,
		saving,
		isDirty,
		canGoNext,
		onPrev,
		onNext,
		onSave,
		downloading = false,
		onDownload,
	} = props;

	const keys = Object.keys(reflectionQuestions ?? {});
	const hasQuestions = keys.length > 0;
	const colsClass = "grid-cols-7"; // Based on total steps
	const isLastStep = step === stepsTotal;

	return (
		<div className="mx-auto w-full max-w-7xl">
			{/* Top header + stepper */}
			<div className="mb-10">
				<div className="flex items-center">
					<BackToWeeklyWorkup></BackToWeeklyWorkup>
					<div className="ml-auto text-sm text-muted">
						{completedCount} of {stepsTotal} completed
					</div>
				</div>

				{/* Progress segments - aligned grid */}
				<div className="mt-3">
					<div className={["grid gap-2", colsClass].join(" ")}>
						{Array.from({ length: stepsTotal }).map((_, i) => {
							const stepNo = i + 1;
							const done =
								stepItems.find((x) => x.step === stepNo)?.isComplete ?? false;
							return (
								<div
									key={stepNo}
									className={[
										"h-2 rounded-full",
										done ? "bg-secondary" : "bg-surface",
									].join(" ")}
								/>
							);
						})}
					</div>

					{/* Step nodes + connectors - same grid */}
					<div className={["mt-3 grid gap-2", colsClass].join(" ")}>
						{stepItems.map((it) => {
							const active = it.step === step;
							return (
								<StepNode
									key={it.step}
									n={it.step}
									title={it.shortTitle}
									active={active}
									complete={it.isComplete}
									locked={it.isLocked}
									onClick={() => onStepClick?.(it.step)}
									className="w-full"
								/>
							);
						})}
					</div>
				</div>
			</div>

			{/* Main card */}
			<section className="app-bg border border-subtle rounded-4xl shadow-sm">
				{/* Title row */}
				<div className="flex items-center gap-3 p-5 mt-2">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-sm font-semibold">
							{step}
						</div>
						<div>
							<div className="text-primary font-semibold">{longTitle}</div>
						</div>
					</div>

					<button
						type="button"
						onClick={() => onSave({ isSubmit: false })}
						disabled={saving || !isDirty}
						className={[
							"ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm",
							"border-subtle",
							saving || !isDirty ? "text-muted" : "text-primary",
							"bg-surface-subtle",
						].join(" ")}
						aria-label="Save progress"
					>
						<Save size={16} />
						Save
					</button>
				</div>

				{/* Content */}
				<div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-5">
					{/* Left */}
					<div className="lg:col-span-3 min-w-0">{children}</div>

					{/* Right */}
					<aside className="lg:col-span-2 min-w-0 flex flex-col gap-4">
						<div className="rounded-3xl border border-secondary bg-secondary-soft-alt p-4 shadow-sm">
							<div className="text-secondary font-semibold">Guidance</div>
							<div className="mt-2 whitespace-pre-line text-sm text-secondary">
								{guidanceText || ""}
							</div>
						</div>

						{!hasQuestions ? (
							<div></div>
						) : (
							<div className="rounded-3xl border border-subtle app-bg p-4 shadow-sm">
								<div className="text-primary font-semibold">
									Reflection Questions
								</div>
								<div className="mt-4 flex flex-col gap-4">
									{keys.sort().map((k) => {
										const q = reflectionQuestions[k];
										return (
											<div key={k} className="flex flex-col gap-2">
												<FormField
													label={`${k}. ${q}`}
													value={reflectionAnswers[k] ?? ""}
													onChange={(next) =>
														onReflectionAnswerChange(k, next ?? "")
													}
													placeholder="Type your answer..."
													multiline
													limit="large"
													showCounter
												/>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</aside>
				</div>

				{/* Footer nav */}
				<div className="grid grid-cols-3 items-center gap-3 border-t border-subtle px-5 py-4">
					<div className="justify-self-start">
						<button
							type="button"
							onClick={onPrev}
							className="inline-flex items-center gap-2 rounded-lg border border-subtle bg-surface-subtle px-3 py-2 text-sm text-primary shadow-sm"
							aria-label="Previous step"
						>
							<ChevronLeft size={16} />
							Previous
						</button>
					</div>

					<div className="justify-self-center text-sm text-muted">
						Step {step} of {stepsTotal}
					</div>

					<div className="justify-self-end">
						{isLastStep ? (
							<button
								type="button"
								disabled={saving || downloading}
								onClick={onDownload}
								className={[
									"inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm",
									"bg-accent text-on-accent",
									saving || downloading ? "opacity-60" : "",
								].join(" ")}
								aria-label="Submit and download DOCX"
							>
								<Download size={16} />
								{downloading
									? "Submitting & Preparing DOCX..."
									: "Submit & Download DOCX"}
							</button>
						) : (
							<button
								type="button"
								onClick={onNext}
								disabled={!canGoNext || saving}
								className={[
									"inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm shadow-sm",
									!canGoNext || saving
										? "bg-surface-subtle text-muted border border-subtle"
										: "bg-accent text-on-accent",
								].join(" ")}
								aria-label="Next step"
							>
								Next
								<ChevronRight size={16} />
							</button>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}
