// file: src/pages/student/submission/edit/mrpTool/MrpToolPage.tsx

import MrpToolScaffold from "./MrpToolScaffold.tsx";
import { useMrpTool } from "../../../hooks/mrpTool.ts";
import Step1 from "./Step1.tsx";
import Step2 from "./Step2.tsx";
import Step3 from "./Step3.tsx";
import Step4 from "./Step4.tsx";
import Step5 from "./Step5.tsx";
import Step6 from "./Step6.tsx";
import Step7 from "./Step7.tsx";
import { totalSteps } from "../../../hooks/constants.ts";
import { useMrpSubmit } from "../../../hooks/submit.ts";
import type { StudentSubmissionState } from "../../WeeklyWorkup.tsx";

export default function MrpToolPage({
	weeklyWorkupId,
	studentEnrollmentId,
}: StudentSubmissionState) {
	const mrp = useMrpTool({ weeklyWorkupId, studentEnrollmentId });
	const submit = useMrpSubmit(mrp);
	const stepItems = mrp.steps.map((s) => ({
		step: s.step,
		shortTitle: s.shortTitle,
		isComplete: Boolean(mrp.completedByStep[s.step]),
		isLocked: s.step > mrp.maxUnlockedStep,
	}));

	const body = (() => {
		switch (mrp.step) {
			case 1:
				return <Step1 mrp={mrp} />;
			case 2:
				return <Step2 mrp={mrp} />;
			case 3:
				return <Step3 mrp={mrp} />;
			case 4:
				return <Step4 mrp={mrp} />;
			case 5:
				return <Step5 mrp={mrp} />;
			case 6:
				return <Step6 mrp={mrp} />;
			case 7:
				return <Step7 mrp={mrp} />;
		}
	})();

	if (mrp.loading) {
		return (
			<div className="mx-auto w-full max-w-7xl">
				<div className="rounded-2xl border border-subtle app-bg px-5 py-4 shadow-sm text-muted">
					Loading...
				</div>
			</div>
		);
	}

	return (
		<div className="pb-10">
			{mrp.error ? (
				<div className="mx-auto mb-4 w-full max-w-7xl rounded-2xl border border-subtle bg-surface-subtle px-5 py-3 text-sm text-primary shadow-sm">
					{mrp.error}
				</div>
			) : null}

			<MrpToolScaffold
				step={mrp.step}
				stepsTotal={totalSteps}
				completedCount={mrp.completedCount}
				longTitle={mrp.meta.longTitle}
				stepItems={stepItems}
				onStepClick={(s) => mrp.goToStep(s as any)}
				guidanceText={mrp.guidanceText}
				reflectionQuestions={mrp.reflectionQuestions}
				reflectionAnswers={mrp.reflectionAnswers}
				onReflectionAnswerChange={mrp.setReflectionAnswer}
				saving={mrp.saving}
				isDirty={mrp.isDirty}
				canGoNext={mrp.canAdvanceFromCurrentStep}
				onPrev={mrp.goPrev}
				onNext={mrp.goNext}
				onSave={mrp.saveIfDirty}
				downloading={submit.downloading}
				onDownload={submit.download}
			>
				{body}
			</MrpToolScaffold>
		</div>
	);
}
