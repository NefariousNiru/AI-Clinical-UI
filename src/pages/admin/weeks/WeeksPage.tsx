// file: src/pages/admin/tests/WeeksPage.tsx

import {useState} from "react";
import SubHeader from "../../../components/SubHeader";
import SemesterDropdown from "../semester/SemesterDropdown.tsx";
import type {Semester} from "../../../lib/types/semester.ts";
import CreateSemesterButton from "../semester/CreateSemesterButton.tsx";

export default function WeeksPage() {
    const [semester, setSemester] = useState<Semester | null>(null);


    return (
        <div className="flex flex-col gap-3">
            <SubHeader
                title="Weekly Workups"
                description="Manage weekly workups for the semester"
                right={
                    <div className="flex flex-wrap items-start gap-2">
                        <SemesterDropdown compact onChange={setSemester}/>
                        <CreateSemesterButton onCreated={(s) => setSemester(s)}/>
                    </div>
                }
            />

            <section className="py-4 px-2">
                {/*<WeeklyWorkups semester={semester} />*/}
            </section>
        </div>
    );
}