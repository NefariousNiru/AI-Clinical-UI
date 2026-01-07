// file: src/pages/student/forms/MedicationListForm.tsx

import { Plus, Trash } from "lucide-react";
import FormCard from "./FormCard";
import FormField from "./FormField";
import type { MedicationList } from "../../../lib/types/studentSubmission";

type Props = {
	value: MedicationList;
	onChange: (next: MedicationList) => void;

	// If you want to manage array ops outside, pass these. If not, component still works without them.
	onAddMedication?: () => void;
	onRemoveMedicationAt?: (index: number) => void;
	onUpdateMedicationAt?: (
		index: number,
		patch: { scheduledStartStopDate?: string; prn?: string },
	) => void;

	readOnly?: boolean;
	className?: string;
};

export default function MedicationListForm({
	value,
	onChange,
	onAddMedication,
	onRemoveMedicationAt,
	onUpdateMedicationAt,
	readOnly,
	className = "",
}: Props) {
	const set = <K extends keyof MedicationList>(k: K, next: MedicationList[K]) =>
		onChange({ ...value, [k]: next });

	const toggle = (k: "sup" | "vtePpx" | "bowelRegimen") => {
		const cur = Boolean(value[k]);
		set(k, !cur as unknown as MedicationList[typeof k]);
	};

	const canEditMeds = Boolean(onUpdateMedicationAt) && !readOnly;

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
										onUpdateMedicationAt?.(idx, { scheduledStartStopDate: x })
									}
									readOnly={!canEditMeds}
									limit={"small"}
								/>

								<div className="md:hidden text-primary text-xs font-medium">
									PRNs (received doses)
								</div>
								<FormField
									label="PRNs (received doses)"
									hideLabel
									value={m.prn}
									onChange={(x) => onUpdateMedicationAt?.(idx, { prn: x })}
									readOnly={!canEditMeds}
									limit={"small"}
								/>
								{onRemoveMedicationAt && !readOnly ? (
									<button
										type="button"
										onClick={() => onRemoveMedicationAt(idx)}
										className="justify-self-end rounded-lg border border-danger px-2 py-1 text-xs text-primary shadow-sm bg-danger-soft text-danger"
									>
										<Trash size={20}></Trash>
									</button>
								) : null}
							</div>
						))}
					</div>

					{onAddMedication && !readOnly ? (
						<button
							type="button"
							onClick={onAddMedication}
							className="mx-auto inline-flex items-center gap-2 px-3 py-2 text-primary text-sm font-medium"
						>
							<Plus size={16} />
							Add Medication
						</button>
					) : null}
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
					<div className="flex flex-col gap-3">
						<div className="text-primary text-xs font-medium">If required:</div>

						<label className="flex items-center gap-2 text-primary text-sm">
							<input
								type="checkbox"
								checked={Boolean(value.sup)}
								onChange={() => toggle("sup")}
								disabled={readOnly}
							/>
							<span>SUP</span>
						</label>

						<label className="flex items-center gap-2 text-primary text-sm">
							<input
								type="checkbox"
								checked={Boolean(value.vtePpx)}
								onChange={() => toggle("vtePpx")}
								disabled={readOnly}
							/>
							<span>VTE DDX</span>
						</label>

						<label className="flex items-center gap-2 text-primary text-sm">
							<input
								type="checkbox"
								checked={Boolean(value.bowelRegimen)}
								onChange={() => toggle("bowelRegimen")}
								disabled={readOnly}
							/>
							<span>Bowel Regimen</span>
						</label>
					</div>
					<FormField
						label="If hospitalized, IV access, lines, tubes:"
						value={value.ivAccessLineTubes}
						onChange={(x) => set("ivAccessLineTubes", x)}
						readOnly={readOnly}
						multiline
						limit={"small"}
						showCounter
					/>
				</div>

				<FormField
					label="OTC / CAM (Over the counter / Complementary Alternative Medicine)"
					value={value.otcCam}
					onChange={(x) => set("otcCam", x)}
					readOnly={readOnly}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="Medication Adherence / Refill History"
					value={value.medicationAdherence}
					onChange={(x) => set("medicationAdherence", x)}
					readOnly={readOnly}
					multiline
					limit={"medium"}
					showCounter
				/>
			</div>
		</FormCard>
	);
}
