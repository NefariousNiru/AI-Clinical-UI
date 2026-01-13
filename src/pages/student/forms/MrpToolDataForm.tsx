// file: src/pages/student/forms/MrpToolDataForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import { makeEmptyMrpToolData, type MrpToolData } from "../../../lib/types/studentSubmission";

type Props = {
	value?: MrpToolData;
	onChange: (next: MrpToolData) => void;
	className?: string;
};

export default function MrpToolDataForm({ value, onChange, className = "" }: Props) {
	const v = value ?? makeEmptyMrpToolData();

	const set = <K extends keyof MrpToolData>(k: K, next?: MrpToolData[K]) => {
		const merged: MrpToolData = { ...v, [k]: next };
		const isAllEmpty = Object.values(merged).every((x) => x == null || String(x).trim() === "");
		onChange(isAllEmpty ? makeEmptyMrpToolData() : merged);
	};

	return (
		<FormCard title="Patient Orientation" className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label="Patient Scenario"
					value={v.patientScenario}
					onChange={(x) => set("patientScenario", x)}
					placeholder={"Review the patient scenario..."}
					limit={"medium"}
					showCounter
					multiline
				/>
				<FormField
					label="Encounter Setting"
					value={v.encounterSetting}
					onChange={(x) => set("encounterSetting", x)}
					placeholder={"e.g., Ambulatory clinic, Hospital inpatient, etc..."}
					limit={"medium"}
					showCounter
					multiline
				/>
			</div>
		</FormCard>
	);
}
