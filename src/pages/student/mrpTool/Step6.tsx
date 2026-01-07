// file: src/pages/student/mrpTool/step6.tsx

import ProgressNotesForm from "../forms/ProgressNotesForm";

type Props = { mrp: any };

export default function Step6({mrp}: Props) {
    return (
        <div className="flex flex-col gap-4">
            <ProgressNotesForm
                value={mrp.patient.progressNotes}
                onChange={mrp.patient.setProgressNotes}
            />
        </div>
    );
}
