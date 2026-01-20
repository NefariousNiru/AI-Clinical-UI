// file: src/pages/student/forms/SocialHistoryForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { SocialHistory } from "../../../lib/types/studentSubmission";
import { SOCIAL_HISTORY_FIELDS } from "../hooks/constants.ts";

type Props = {
	value: SocialHistory;
	onChange: (next: SocialHistory) => void;
	className?: string;
};

export default function SocialHistoryForm({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof SocialHistory>(k: K, next?: SocialHistory[K]) =>
		onChange({ ...value, [k]: next });

	const CONSTANTS = SOCIAL_HISTORY_FIELDS;
	const FIELDS = CONSTANTS.fields;

	return (
		<FormCard title={CONSTANTS.title} className={className}>
			<div className="flex flex-wrap gap-3">
				<div className="min-w-[240px] flex-1">
					<FormField
						label={FIELDS.occupation.label}
						value={value.occupation}
						onChange={(x) => set("occupation", x)}
						multiline={FIELDS.occupation.multiline}
						limit={FIELDS.occupation.limit}
						showCounter={FIELDS.occupation.showCounter}
					/>
				</div>

				<div className="min-w-[240px] flex-1">
					<FormField
						label={FIELDS.supportSystem.label}
						value={value.supportSystem}
						onChange={(x) => set("supportSystem", x)}
						limit={FIELDS.supportSystem.limit}
						showCounter={FIELDS.supportSystem.showCounter}
						multiline={FIELDS.supportSystem.multiline}
					/>
				</div>

				{/* Drugs - force 2 per row on large screens */}
				<div className="basis-full grid grid-cols-1 gap-3 lg:grid-cols-2">
					<FormField
						label={FIELDS.tobaccoUse.label}
						value={value.tobaccoUse}
						onChange={(x) => set("tobaccoUse", x)}
						limit={FIELDS.tobaccoUse.limit}
					/>

					<FormField
						label={FIELDS.alcoholUse.label}
						value={value.alcoholUse}
						onChange={(x) => set("alcoholUse", x)}
						limit={FIELDS.alcoholUse.limit}
					/>

					<FormField
						label={FIELDS.thcUse.label}
						value={value.thcUse}
						onChange={(x) => set("thcUse", x)}
						limit={FIELDS.thcUse.limit}
					/>

					<FormField
						label={FIELDS.cocaineUse.label}
						value={value.cocaineUse}
						onChange={(x) => set("cocaineUse", x)}
						limit={FIELDS.cocaineUse.limit}
					/>
				</div>

				<div className="basis-full">
					<FormField
						label={FIELDS.otherSubstanceUse.label}
						value={value.otherSubstanceUse}
						onChange={(x) => set("otherSubstanceUse", x)}
						limit={FIELDS.otherSubstanceUse.limit}
						showCounter={FIELDS.otherSubstanceUse.showCounter}
						multiline={FIELDS.otherSubstanceUse.multiline}
					/>
				</div>
			</div>
		</FormCard>
	);
}
