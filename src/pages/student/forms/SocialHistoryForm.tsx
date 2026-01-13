// file: src/pages/student/forms/SocialHistoryForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { SocialHistory } from "../../../lib/types/studentSubmission";

type Props = {
	value: SocialHistory;
	onChange: (next: SocialHistory) => void;
	className?: string;
};

export default function SocialHistoryForm({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof SocialHistory>(k: K, next?: SocialHistory[K]) =>
		onChange({ ...value, [k]: next });

	return (
		<FormCard title="Social History" className={className}>
			<div className="flex flex-wrap gap-3">
				<div className="min-w-[240px] flex-1">
					<FormField
						label="Occupation / Occupation related notes"
						value={value.occupation}
						onChange={(x) => set("occupation", x)}
						multiline
						limit={"small"}
						showCounter
					/>
				</div>

				<div className="min-w-[240px] flex-1">
					<FormField
						label="Support System"
						value={value.supportSystem}
						onChange={(x) => set("supportSystem", x)}
						multiline
						limit={"small"}
						showCounter
					/>
				</div>

				{/* Drugs - force 2 per row on large screens */}
				<div className="basis-full grid grid-cols-1 gap-3 lg:grid-cols-2">
					<FormField
						label="Tobacco Use"
						value={value.tobaccoUse}
						onChange={(x) => set("tobaccoUse", x)}
						limit={"xSmall"}
					/>

					<FormField
						label="Alcohol Use"
						value={value.alcoholUse}
						onChange={(x) => set("alcoholUse", x)}
						limit={"xSmall"}
					/>

					<FormField
						label="THC Use"
						value={value.thcUse}
						onChange={(x) => set("thcUse", x)}
						limit={"xSmall"}
					/>

					<FormField
						label="Cocaine Use"
						value={value.cocaineUse}
						onChange={(x) => set("cocaineUse", x)}
						limit={"xSmall"}
					/>
				</div>

				<div className="basis-full">
					<FormField
						label="Other Substance Use"
						value={value.otherSubstanceUse}
						onChange={(x) => set("otherSubstanceUse", x)}
						multiline
						limit={"medium"}
						showCounter
					/>
				</div>
			</div>
		</FormCard>
	);
}
