// file: src/pages/student/submission/view/PatientInformationViewTab.tsx

import {
	MEDICAL_HISTORY_FIELDS,
	MRP_TOOL_DATA_FIELDS,
	PATIENT_DEMOGRAPHICS_FIELDS,
	SOCIAL_HISTORY_FIELDS,
} from "../../hooks/constants";
import type {
	MedicalHistory,
	MrpToolData,
	PatientDemographics,
	SocialHistory,
} from "../../../../lib/types/studentSubmission.ts";
import {
	FieldGridSection,
	isAnySectionMeaningful,
	LongFieldSection,
	ReflectionSection,
} from "./ViewComponents.tsx";

export default function PatientInformationViewTab({
	mrpToolData,
	patientDemographics,
	socialHistory,
	medicalHistory,
}: {
	mrpToolData: MrpToolData;
	patientDemographics: PatientDemographics;
	socialHistory: SocialHistory;
	medicalHistory: MedicalHistory;
}) {
	const hasAnything = isAnySectionMeaningful([
		mrpToolData,
		patientDemographics,
		socialHistory,
		medicalHistory,
	]);

	if (!hasAnything) {
		return (
			<div className="rounded-xl border border-subtle app-bg p-5">
				<div className="text-sm text-muted">No patient information was submitted.</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<LongFieldSection<MrpToolData>
					title={MRP_TOOL_DATA_FIELDS.title}
					fieldsSpec={MRP_TOOL_DATA_FIELDS as any}
					data={mrpToolData}
				/>
				<ReflectionSection reflectionAnswers={mrpToolData.reflectionAnswers} />
			</div>

			<div>
				<FieldGridSection<PatientDemographics>
					title={PATIENT_DEMOGRAPHICS_FIELDS.title}
					fieldsSpec={PATIENT_DEMOGRAPHICS_FIELDS as any}
					data={patientDemographics}
				/>
				<ReflectionSection reflectionAnswers={patientDemographics.reflectionAnswers} />
			</div>

			<div>
				<LongFieldSection<SocialHistory>
					title={SOCIAL_HISTORY_FIELDS.title}
					fieldsSpec={SOCIAL_HISTORY_FIELDS as any}
					data={socialHistory}
				/>
				{/* SocialHistory has no reflectionAnswers */}
			</div>

			<div>
				<LongFieldSection<MedicalHistory>
					title={MEDICAL_HISTORY_FIELDS.title}
					fieldsSpec={MEDICAL_HISTORY_FIELDS as any}
					data={medicalHistory}
				/>
				<ReflectionSection reflectionAnswers={medicalHistory.reflectionAnswers} />
			</div>
		</div>
	);
}
