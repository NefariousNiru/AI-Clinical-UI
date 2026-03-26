// file: src/pages/student/forms/MrpToolDataForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import { makeEmptyMrpToolData, type MrpToolData } from "../../../lib/types/studentSubmission";
import { MRP_TOOL_DATA_FIELDS } from "../hooks/constants.ts";

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

	const CONSTANTS = MRP_TOOL_DATA_FIELDS;
	const FIELDS = CONSTANTS.fields;

	return (
		<FormCard title={CONSTANTS.title} className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label={FIELDS.patientScenario.label}
					value={v.patientScenario}
					onChange={(x) => set("patientScenario", x)}
					placeholder={FIELDS.patientScenario.placeholder}
					limit={FIELDS.patientScenario.limit}
					showCounter={FIELDS.patientScenario.showCounter}
					multiline={FIELDS.patientScenario.multiline}
				/>
				<FormField
					label={FIELDS.encounterSetting.label}
					value={v.encounterSetting}
					onChange={(x) => set("encounterSetting", x)}
					placeholder={FIELDS.encounterSetting.placeholder}
					limit={FIELDS.encounterSetting.limit}
					showCounter={FIELDS.encounterSetting.showCounter}
					multiline={FIELDS.encounterSetting.multiline}
				/>
			</div>
		</FormCard>
	);
}
