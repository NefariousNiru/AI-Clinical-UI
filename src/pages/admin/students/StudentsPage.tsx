// file: src/pages/admin/tests/StudentsPage.tsx

import {useState} from "react";
import SubHeader from "../../../components/SubHeader";
import SemesterDropdown from "../SemesterDropdown";
import Tabs from "../../../components/Tabs";

type StudentTabKey = "roster" | "submissions";

type StudentTabsProps = {
    activeTab: StudentTabKey;
    onChange: (next: StudentTabKey) => void;
};

export default function StudentsPage() {
    const [activeTab, setActiveTab] = useState<StudentTabKey>("roster");

    return (
        <div className="flex flex-col gap-3">
            <SubHeader
                sticky
                title="Students"
                description="Manage student roster, submissions and deadlines for the semester."
                tabs={
                    <StudentTabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                }
                right={<SemesterDropdown compact/>}
            />

            <section className="rounded-lg border border-subtle bg-surface p-4">
                {activeTab === "roster" ? (
                    <StudentRosterTab/>
                ) : (
                    <StudentSubmissionsTab/>
                )}
            </section>
        </div>
    );
}

/* ----------------- Page level tabs (reuse shared Tabs) ----------------- */

function StudentTabs({activeTab, onChange}: StudentTabsProps) {
    return (
        <Tabs
            value={activeTab}
            onChange={(v) => onChange(v as StudentTabKey)}
            items={[
                {value: "roster", label: "Roster"},
                {value: "submissions", label: "Submissions & deadlines"},
            ]}
            fullWidth
        />
    );
}

/* ----------------- Tab content placeholders ----------------- */

function StudentRosterTab() {
    return (
        <div className="space-y-2">
            <h2 className="text-sm font-semibold text-primary">
                Roster (placeholder)
            </h2>
            <p className="text-sm text-muted">
                This area will show the student roster for the selected semester.
            </p>
        </div>
    );
}

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
