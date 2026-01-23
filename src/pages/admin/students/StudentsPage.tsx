// file: src/pages/admin/students/StudentsPage.tsx

import { useState } from "react";
import SubHeader from "../../../components/SubHeader";
import SemesterDropdown from "../semester/SemesterDropdown.tsx";
import Tabs from "../../../components/Tabs";
import type { Semester } from "../../../lib/types/semester.ts";
import StudentRosterTab from "./StudentRosterTab.tsx";
import CreateSemesterButton from "../semester/CreateSemesterButton.tsx";
import { StudentSubmissionsAndDeadlinesTab } from "./StudentSubmissionsAndDeadlinesTab.tsx";

type StudentTabKey = "roster" | "submissions";

export default function StudentsPage() {
	const [activeTab, setActiveTab] = useState<StudentTabKey>("roster");
	const [semester, setSemester] = useState<Semester | null>(null); // <-- add

	return (
		<div className="flex flex-col gap-3">
			<SubHeader
				title="Students"
				description="Manage student roster, submissions and deadlines for the semester."
				tabs={
					<Tabs
						value={activeTab}
						onChange={(v) => setActiveTab(v as StudentTabKey)}
						items={[
							{ value: "roster", label: "Roster" },
							{ value: "submissions", label: "Submissions & Deadlines" },
						]}
						fullWidth
					/>
				}
				right={
					<div className="flex flex-wrap items-start gap-2">
						<SemesterDropdown compact onChange={setSemester} />
						<CreateSemesterButton />
					</div>
				}
			/>

			<section className="py-4 px-2">
				{activeTab === "roster" ? (
					<StudentRosterTab semester={semester} />
				) : (
					<StudentSubmissionsAndDeadlinesTab semester={semester} />
				)}
			</section>
		</div>
	);
}
