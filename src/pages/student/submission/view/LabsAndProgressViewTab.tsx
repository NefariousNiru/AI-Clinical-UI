// file: src/pages/student/submission/view/LabsAndProgressViewTab.tsx

import type { LabResult, ProgressNotes } from "../../../../lib/types/studentSubmission.ts";
import { LAB_RESULT_FIELDS, PROGRESS_NOTES_FIELDS } from "../../hooks/constants";
import { isAnySectionMeaningful, LongFieldSection, ReflectionSection } from "./ViewComponents.tsx";

export default function LabsAndProgressViewTab({
	labResult,
	progressNotes,
}: {
	labResult: LabResult;
	progressNotes: ProgressNotes;
}) {
	const hasAnything = isAnySectionMeaningful([labResult, progressNotes]);

	if (!hasAnything) {
		return (
			<div className="rounded-xl border border-subtle app-bg p-5">
				<div className="text-sm text-muted">No labs or progress notes were submitted.</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<LongFieldSection<LabResult>
					title={LAB_RESULT_FIELDS.title}
					fieldsSpec={LAB_RESULT_FIELDS as any}
					data={labResult}
				/>
				<ReflectionSection reflectionAnswers={labResult.reflectionAnswers} />
			</div>

			<div>
				<LongFieldSection<ProgressNotes>
					title={PROGRESS_NOTES_FIELDS.title}
					fieldsSpec={PROGRESS_NOTES_FIELDS as any}
					data={progressNotes}
				/>
				<ReflectionSection reflectionAnswers={progressNotes.reflectionAnswers} />
			</div>
		</div>
	);
}
