// file: src/pages/shared/WorkupStatusPill.tsx

import type { WeeklyWorkupStudentStatus } from "../../lib/types/studentWeeks.ts";
import { STATUS_UI } from "../../lib/constants/ui.ts";
import { titleizeCase } from "../../lib/utils/functions.ts";

export function WorkupStatusPill({ status }: { status: WeeklyWorkupStudentStatus }) {
	const cfg = STATUS_UI[status];
	return (
		<span
			className={[
				"inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold border leading-none",
				cfg.pill,
				cfg.border,
			].join(" ")}
			title={titleizeCase(status)}
		>
			{titleizeCase(status)}
		</span>
	);
}
