// file: src/pages/admin/tests/StudentsPage.tsx

import {useState} from "react";
import SubHeader from "../../../components/SubHeader";
import SemesterDropdown from "../semester/SemesterDropdown.tsx";
import Tabs from "../../../components/Tabs";
import type {Semester} from "../../../lib/types/semester.ts";
import StudentRosterTab from "./StudentRosterTab.tsx";
import CreateSemesterButton from "../semester/CreateSemesterButton.tsx";

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
                            {value: "roster", label: "Roster"},
                            {value: "submissions", label: "Submissions & deadlines"},
                        ]}
                        fullWidth
                    />
                }
                right={
                    <div className="flex flex-wrap items-start gap-2">
                        <SemesterDropdown compact onChange={setSemester}/>
                        <CreateSemesterButton/>
                    </div>
                }
            />

            <section className="py-4 px-2">
                {activeTab === "roster" ? (
                    <StudentRosterTab semester={semester}/>
                ) : (
                    <StudentSubmissionsTab/>
                )}
            </section>
        </div>
    );
}

/* ----------------- Page level tabs (reuse shared Tabs) ----------------- */

function StudentSubmissionsTab() {
    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold text-primary">
                Submissions and deadlines (placeholder)
            </h2>
            <p className="text-sm text-muted">
                This area will show submissions, deadlines, and related status for
                the selected semester.
            </p>
        </div>
    );
}
