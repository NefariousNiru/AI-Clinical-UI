// file: src/pages/admin/students/StudentRosterTab.tsx

import type { Semester } from "../../../lib/types/semester";
import type { NewRosterStudent, RosterStudent } from "../../../lib/types/roster";
import { useRosterUi } from "../hooks/roster";
import {
	ActionChip,
	btnPrimary,
	btnSecondary,
	btnSecondaryAccent,
	InlineNotice,
	SemesterModeBadge,
} from "../../shared/SharedUI.tsx";

type Props = {
	semester: Semester | null;
};

export default function StudentRosterTab({ semester }: Props) {
	const r = useRosterUi(semester);

	return (
		<div className="space-y-4 app-bg">
			{/* Top: actions (CSV + single add) */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* CSV */}
				<section className="rounded-[1.75rem] bg-input shadow-sm border border-subtle p-4">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h2 className="text-sm font-semibold text-primary">Upload CSV</h2>
							<p className="text-xs text-muted mt-1">
								Add students in bulk. Only UGA emails allowed (@uga.edu). CSV
								format: <span className="font-medium">name, email</span>
							</p>
						</div>

						<SemesterModeBadge semester={semester} />
					</div>

					<div className="mt-3 space-y-2">
						<div className="flex flex-col gap-2">
							<input
								id="roster-csv"
								type="file"
								accept=".csv,text/csv"
								onChange={r.onCsvFileChange}
								className="sr-only"
								disabled={r.isViewOnly || r.saving || r.actionBusy}
							/>

							<label
								htmlFor="roster-csv"
								className={[
									"rounded-3xl",
									btnSecondaryAccent,
									"w-full",
									r.isViewOnly || r.saving || r.actionBusy
										? "opacity-60 cursor-not-allowed pointer-events-none"
										: "cursor-pointer",
								].join(" ")}
								aria-label="Choose a CSV file to add students"
							>
								Choose CSV file
							</label>

							<div className="text-[11px] text-muted">
								{r.lastCsvName ? (
									<span>
										Selected:{" "}
										<span className="font-semibold text-primary">
											{r.lastCsvName}
										</span>
									</span>
								) : (
									<span>No file selected</span>
								)}
							</div>
						</div>

						<div className="rounded-2xl bg-surface-subtle p-3">
							<p className="text-[11px] text-muted">
								<span className="font-semibold text-primary">Target:</span>{" "}
								{r.summaryText}
							</p>
							<p className="text-[11px] text-muted mt-1">{r.helperText}</p>
							{semester?.isCurrent ? (
								<p className="text-[11px] text-muted mt-1">
									<span className="font-semibold text-primary">Save</span> will
									add all “Currently being added” students in one request.
								</p>
							) : null}
						</div>

						{r.csvError ? <InlineNotice tone="danger" text={r.csvError} /> : null}
					</div>
				</section>

				{/* Single entry */}
				<section className="rounded-[1.75rem] bg-input shadow-sm border border-subtle p-4">
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-primary">Add one student</h2>
						<p className="text-xs text-muted mt-1">
							Adds to “Currently being added” until you press{" "}
							<span className="font-semibold text-primary">Save</span>.
						</p>
					</div>

					<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Field label="Name">
							<input
								value={r.name}
								onChange={(e) => r.setName(e.target.value)}
								className={inputClass}
								placeholder="Jane Doe"
								disabled={r.isViewOnly || r.saving || r.actionBusy}
								aria-label="Student name"
							/>
						</Field>

						<Field label="Email (@uga.edu)">
							<input
								value={r.email}
								onChange={(e) => r.setEmail(e.target.value)}
								className={inputClass}
								placeholder="jane@uga.edu"
								disabled={r.isViewOnly || r.saving || r.actionBusy}
								aria-label="Student email"
							/>
						</Field>
					</div>

					<div className="mt-3 flex items-center justify-end gap-2">
						<button
							type="button"
							onClick={r.addSingle}
							disabled={!r.canMutate}
							className={[
								btnPrimary,
								"disabled:opacity-60 disabled:cursor-not-allowed",
							].join(" ")}
						>
							Add
						</button>
					</div>
				</section>
			</div>

			{/* Roster list */}
			<section className="rounded-[1.75rem] bg-input shadow-sm border border-subtle">
				<div className="p-4 flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-primary">Roster</h2>
						<p className="text-xs text-muted mt-1">{r.rosterSubtitle}</p>

						{r.actionToast ? (
							<div className="mt-2">
								<InlineNotice
									tone={r.actionToast.tone === "success" ? "success" : "danger"}
									text={r.actionToast.text}
								/>
							</div>
						) : null}
					</div>

					<div className="flex items-center gap-2 shrink-0">
						<button
							type="button"
							onClick={r.selectAllEligible}
							disabled={!r.canMutate || r.eligibleEnrollmentIds.length === 0}
							className={[
								btnSecondary,
								"disabled:opacity-60 disabled:cursor-not-allowed",
							].join(" ")}
							aria-label="Select all eligible enrollments"
							title="Select only active enrollments"
						>
							Select all
						</button>

						<button
							type="button"
							onClick={() => void r.bulkDeactivateSemester()}
							disabled={!r.canMutate || r.bulkDeactivateEligibleCount === 0}
							className={[
								btnSecondary,
								"disabled:opacity-60 disabled:cursor-not-allowed",
							].join(" ")}
							title="Disenroll selected students from the current semester"
							aria-label="Bulk disenroll selected students"
						>
							<span className="hidden sm:inline">Bulk disenroll</span>
							<span className="sm:hidden">Bulk</span>
						</button>

						<button
							type="button"
							onClick={r.clearEnrollmentSelection}
							disabled={r.selectedEnrollmentIds.size === 0 || r.actionBusy}
							className={[
								btnSecondary,
								"disabled:opacity-60 disabled:cursor-not-allowed",
							].join(" ")}
							aria-label="Clear current selection"
						>
							Clear
						</button>
					</div>
				</div>

				{r.loading ? (
					<div className="px-4 pb-4">
						<p className="text-xs text-muted">Loading roster...</p>
					</div>
				) : r.error ? (
					<div className="px-4 pb-4">
						<InlineNotice tone="danger" text={r.error} />
					</div>
				) : null}

				{/* Pending */}
				{r.hasPending ? (
					<div className="px-4 pb-4">
						<div className="flex items-center justify-between gap-2">
							<div>
								<h3 className="text-xs font-semibold text-primary">
									Currently being added
								</h3>
								<p className="text-[11px] text-muted mt-0.5">
									Review and save all at once. These are not in the database yet.
								</p>
							</div>

							<button
								type="button"
								onClick={() => void r.savePendingToDb()}
								disabled={!r.canMutate}
								className={[
									btnPrimary,
									"disabled:opacity-60 disabled:cursor-not-allowed",
								].join(" ")}
								aria-label="Save pending students to the database"
							>
								{r.saving ? "Saving..." : "Save"}
							</button>
						</div>

						<div className="mt-3 overflow-x-auto" aria-label="Pending students table">
							<div className="min-w-[940px] rounded-2xl border border-subtle overflow-hidden">
								<TableHeader />
								{r.pendingSorted.map((s) => (
									<PendingRow
										key={s.email}
										student={s}
										onRemove={() =>
											r.setPending((prev) =>
												prev.filter((x) => x.email !== s.email),
											)
										}
										disabled={!r.canMutate}
									/>
								))}
							</div>
						</div>
					</div>
				) : null}

				{/* Existing */}
				<div className="px-4 pb-4">
					<div className="flex items-baseline justify-between">
						<h3 className="text-xs font-semibold text-primary">Existing students</h3>
						<span className="text-[11px] text-muted">
							{r.existingSorted.length} total
						</span>
					</div>

					{r.existingSorted.length === 0 ? (
						<p className="mt-2 text-xs text-muted">
							No students found for this semester.
						</p>
					) : (
						<div className="mt-3 overflow-x-auto" aria-label="Existing students table">
							<div className="min-w-[940px] rounded-2xl border border-subtle overflow-hidden">
								<TableHeader />
								{r.existingSorted.map((s) => (
									<ExistingRow
										key={s.enrollmentId}
										student={s}
										selected={r.selectedEnrollmentIds.has(s.enrollmentId)}
										onToggleSelected={() =>
											r.toggleEnrollmentSelected(s.enrollmentId)
										}
										onNotifyUser={() => void r.resendUserActivation(s)}
										onNotifyEnrollment={() =>
											void r.resendEnrollmentActivation(s)
										}
										onDeactivateUser={() => void r.deactivateUser(s)}
										onDisenroll={() => void r.deactivateEnrollment(s)}
										busy={r.actionBusy}
										busyKey={r.actionBusyKey}
										viewOnly={r.isViewOnly}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}

/* ----------------- table layout ----------------- */

const tableGrid = "grid grid-cols-[1.3fr_1.6fr_240px_1.2fr_56px] gap-3";

function TableHeader() {
	return (
		<div
			className={[
				tableGrid,
				"px-4 py-2 text-[11px] font-semibold bg-accent text-on-accent",
			].join(" ")}
			role="row"
		>
			<div>Name</div>
			<div>Email</div>
			<div>Status</div>
			<div className="text-right pr-1">Actions</div>
			<div className="text-right pr-1">Select</div>
		</div>
	);
}

function PendingRow({
	student,
	onRemove,
	disabled,
}: {
	student: NewRosterStudent;
	onRemove: () => void;
	disabled: boolean;
}) {
	return (
		<div className={[tableGrid, "px-4 py-3 items-center row-item"].join(" ")} role="row">
			<div className="min-w-0">
				<div className="text-xs font-semibold text-primary truncate">{student.name}</div>
			</div>

			<div className="min-w-0">
				<div className="text-xs text-muted truncate">{student.email}</div>
			</div>

			<div className="flex items-center gap-2">
				<Pill label="User" state="pending" />
				<Pill label="Enrollment" state="pending" />
			</div>

			<div className="flex justify-end">
				<button
					type="button"
					onClick={onRemove}
					disabled={disabled}
					className={[
						btnSecondary,
						"disabled:opacity-60 disabled:cursor-not-allowed",
					].join(" ")}
					aria-label={`Remove pending student ${student.email}`}
				>
					Remove
				</button>
			</div>

			<div />
		</div>
	);
}

function ExistingRow({
	student,
	selected,
	onToggleSelected,
	onNotifyUser,
	onNotifyEnrollment,
	onDeactivateUser,
	onDisenroll,
	busy,
	busyKey,
	viewOnly,
}: {
	student: RosterStudent;
	selected: boolean;
	onToggleSelected: () => void;
	onNotifyUser: () => void;
	onNotifyEnrollment: () => void;
	onDeactivateUser: () => void;
	onDisenroll: () => void;
	busy: boolean;
	busyKey: string | null;
	viewOnly: boolean;
}) {
	const showResendUserActivation = !student.isActiveUser;
	const showResendEnrollmentActivation = student.isActiveUser && !student.isActiveSemester;

	const showDeactivateUser = student.isActiveUser;
	const showDisenroll = student.isActiveUser && student.isActiveSemester;

	const actionsDisabled = busy || viewOnly;

	const isResendUserBusy = busyKey === `user:${student.userId}:resend_user`;
	const isResendEnrollBusy = busyKey === `enr:${student.enrollmentId}:resend_enrollment`;
	const isDeactivateUserBusy = busyKey === `user:${student.userId}:deactivate`;
	const isDisenrollBusy = busyKey === `enr:${student.enrollmentId}:disenroll`;

	return (
		<div className={[tableGrid, "px-4 py-3 items-center row-item"].join(" ")} role="row">
			<div className="min-w-0">
				<div className="text-xs font-semibold text-primary truncate">{student.name}</div>
			</div>

			<div className="min-w-0">
				<div className="text-xs text-muted truncate">{student.email}</div>
			</div>

			<div className="flex items-center gap-2">
				<Pill label="User" state={student.isActiveUser ? "on" : "off"} />
				<Pill label="Enrollment" state={student.isActiveSemester ? "on" : "off"} />
			</div>

			<div className="flex justify-end">
				<div className="flex flex-wrap gap-2 justify-end">
					{showResendUserActivation ? (
						<ActionChip
							label={isResendUserBusy ? "Sending..." : "Resend user activation"}
							mobileLabel={isResendUserBusy ? "Sending..." : "Resend user"}
							onClick={onNotifyUser}
							disabled={actionsDisabled}
							ariaLabel={`Resend user activation email to ${student.email}`}
						/>
					) : null}

					{showResendEnrollmentActivation ? (
						<ActionChip
							label={
								isResendEnrollBusy ? "Sending..." : "Resend enrollment activation"
							}
							mobileLabel={isResendEnrollBusy ? "Sending..." : "Resend enroll"}
							onClick={onNotifyEnrollment}
							disabled={actionsDisabled}
							ariaLabel={`Resend enrollment activation email to ${student.email}`}
						/>
					) : null}

					{showDeactivateUser ? (
						<ActionChip
							label={isDeactivateUserBusy ? "Deactivating..." : "Deactivate user"}
							mobileLabel={
								isDeactivateUserBusy ? "Deactivating..." : "Deactivate user"
							}
							tone="danger"
							onClick={onDeactivateUser}
							disabled={actionsDisabled}
							title="User will lose full access to the application."
							ariaLabel={`Deactivate user account for ${student.email}`}
						/>
					) : null}

					{showDisenroll ? (
						<ActionChip
							label={isDisenrollBusy ? "Disenrolling..." : "Disenroll"}
							mobileLabel={isDisenrollBusy ? "Disenrolling..." : "Disenroll"}
							tone="danger"
							onClick={onDisenroll}
							disabled={actionsDisabled}
							title="Student keeps history, but no future updates are pushed."
							ariaLabel={`Disenroll ${student.email} from the semester`}
						/>
					) : null}
				</div>
			</div>

			<div className="flex justify-end pr-1">
				<input
					type="checkbox"
					checked={selected}
					onChange={onToggleSelected}
					disabled={busy}
					className="h-4 w-4"
					aria-label={`Select enrollment for ${student.email}`}
				/>
			</div>
		</div>
	);
}

/* ----------------- atoms ----------------- */

const inputClass = [
	"w-full rounded-2xl border border-subtle bg-input px-3 py-2 text-xs text-primary",
	"focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent",
	"disabled:opacity-60 disabled:cursor-not-allowed",
].join(" ");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<label className="flex flex-col gap-1">
			<span className="text-[11px] font-semibold text-muted">{label}</span>
			{children}
		</label>
	);
}

function Pill({ label, state }: { label: string; state: "on" | "off" | "pending" }) {
	const cls =
		state === "on"
			? "bg-status-feedback text-status-feedback border border-status-feedback"
			: "bg-status-missed text-status-missed border border-status-missed";

	const value = state === "on" ? "ON" : state === "off" ? "OFF" : "NEW";

	return (
		<span
			className={[
				"inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold border",
				"leading-none",
				cls,
			].join(" ")}
			title={state === "on" ? "Active" : state === "off" ? "Inactive" : "Pending"}
		>
			<span className="opacity-90">{label}</span>
			<span className="mx-2 h-3 w-px bg-border-subtle" aria-hidden="true" />
			<span className="font-bold">{value}</span>
		</span>
	);
}
