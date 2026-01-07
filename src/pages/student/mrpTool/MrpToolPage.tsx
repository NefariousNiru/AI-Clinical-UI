// file: src/pages/student/mrpTool/MrpToolPage.tsx

import {useLocation, Navigate} from "react-router-dom";
import MrpToolWizard from "./MrpToolWizard";
import {STUDENT} from "../../../routes.ts";

type NavState = {
    weeklyWorkupId: number;
    studentEnrollmentId: string;
};

export default function MrpToolPage() {
    const loc = useLocation();
    const st = loc.state as NavState | null;
    const route = `${STUDENT}`;
    if (!st?.weeklyWorkupId || !st?.studentEnrollmentId) {
        return <Navigate to={route} replace/>;
    }

    return <MrpToolWizard weeklyWorkupId={st.weeklyWorkupId} studentEnrollmentId={st.studentEnrollmentId}/>;
}
