// file: src/pages/student/forms/MedicationListForm.tsx

import { Plus, Trash } from "lucide-react";
import FormCard from "./FormCard";
import FormField from "./FormField";
import type { MedicationHistory, MedicationList } from "../../../lib/types/studentSubmission";
import { makeEmptyMedication } from "../hooks/useStudentSubmissionEditor.ts";

type Props = {
	value: MedicationList;
	onChange: (next: MedicationList) => void;

	// Optional overrides. If omitted, component performs array ops internally via `onChange`.
	onAddMedication?: () => void;
	onRemoveMedicationAt?: (index: number) => void;
	onUpdateMedicationAt?: (index: number, patch: Partial<MedicationHistory>) => void;

	className?: string;
};

export default function MedicationListForm({
	value,
	onChange,
	onAddMedication,
	onRemoveMedicationAt,
	onUpdateMedicationAt,
	className = "",
}: Props) {
	const set = <K extends keyof MedicationList>(k: K, next: MedicationList[K]) =>
		onChange({ ...value, [k]: next });

	const toggle = (k: "sup" | "vtePpx" | "bowelRegimen") => {
		const cur = Boolean(value[k]);
		set(k, !cur as unknown as MedicationList[typeof k]);
	};

	// ----------------------------- Default functions to manage list ------------------------------
	// Defaults make the component usable even without external handlers.
	const addMedication =
		onAddMedication ??
		(() => {
			onChange({ ...value, medications: [...value.medications, makeEmptyMedication()] });
		});

	const removeMedicationAt =
		onRemoveMedicationAt ??
		((index: number) => {
			onChange({ ...value, medications: value.medications.filter((_, i) => i !== index) });
		});

	const updateMedicationAt =
		onUpdateMedicationAt ??
		((index: number, patch: Partial<MedicationHistory>) => {
			const meds = value.medications.slice();
			const cur = meds[index];
			if (!cur) return;
			meds[index] = { ...cur, ...patch };
			onChange({ ...value, medications: meds });
		});
	// ---------------------------------------------------------------------------------------------

	return (
		<FormCard title="Medications & History" className={className}>
			<div className="flex flex-col gap-6">
				<div className="grid grid-cols-1 gap-3">
					<div className="hidden md:grid md:grid-cols-2 md:gap-6">
						<div className="text-primary text-xs font-medium">
							Drug & Schedule (Start / Stop) Date
						</div>
						<div className="text-primary text-xs font-medium">
							PRNs (received doses)
						</div>
					</div>

					<div className="grid grid-cols-1 gap-3">
						{value.medications.map((m, idx) => (
							<div
								key={idx}
								className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-center"
							>
								{/* Mobile labels (since headers are hidden on mobile) */}
								<div className="md:hidden text-primary text-xs font-medium">
									Drug & Schedule (Start / Stop) Date
								</div>
								<FormField
									label="Drug & Schedule (Start / Stop) Date"
									hideLabel
									value={m.scheduledStartStopDate}
									onChange={(x) =>
										updateMedicationAt(idx, { scheduledStartStopDate: x })
									}
									limit={"small"}
								/>

								<div className="md:hidden text-primary text-xs font-medium">
									PRNs (received doses)
								</div>
								<FormField
									label="PRNs (received doses)"
									hideLabel
									value={m.prn}
									onChange={(x) => updateMedicationAt(idx, { prn: x })}
									limit={"small"}
								/>

								<button
									type="button"
									onClick={() => removeMedicationAt(idx)}
									className="justify-self-end rounded-lg border border-danger px-2 py-1 text-xs text-primary shadow-sm bg-danger-soft text-danger"
									aria-label={`Remove medication ${idx + 1}`}
								>
									<Trash size={20} />
								</button>
							</div>
						))}
					</div>

					<button
						type="button"
						onClick={addMedication}
						className="mx-auto inline-flex items-center gap-2 px-3 py-2 text-primary text-sm font-medium"
					>
						<Plus size={16} />
						Add Medication
					</button>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
					<div className="flex flex-col gap-3">
						<div className="text-primary text-xs font-medium">If required:</div>

						<label className="flex items-center gap-2 text-primary text-sm">
							<input
								type="checkbox"
								checked={Boolean(value.sup)}
								onChange={() => toggle("sup")}
							/>
							<span>SUP</span>
						</label>

						<label className="flex items-center gap-2 text-primary text-sm">
							<input
								type="checkbox"
								checked={Boolean(value.vtePpx)}
								onChange={() => toggle("vtePpx")}
							/>
							<span>VTE DDX</span>
						</label>

						<label className="flex items-center gap-2 text-primary text-sm">
							<input
								type="checkbox"
								checked={Boolean(value.bowelRegimen)}
								onChange={() => toggle("bowelRegimen")}
							/>
							<span>Bowel Regimen</span>
						</label>
					</div>

					<FormField
						label="If hospitalized, IV access, lines, tubes:"
						value={value.ivAccessLineTubes}
						onChange={(x) => set("ivAccessLineTubes", x)}
						multiline
						limit={"small"}
						showCounter
					/>
				</div>

				<FormField
					label="OTC / CAM (Over the counter / Complementary Alternative Medicine)"
					value={value.otcCam}
					onChange={(x) => set("otcCam", x)}
					multiline
					limit={"medium"}
					showCounter
				/>

				<FormField
					label="Medication Adherence / Refill History"
					value={value.medicationAdherence}
					onChange={(x) => set("medicationAdherence", x)}
					multiline
					limit={"medium"}
					showCounter
				/>
			</div>
		</FormCard>
	);
}
