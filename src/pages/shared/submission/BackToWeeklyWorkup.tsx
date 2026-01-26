// file: src/pages/shared/submission/BackToWeeklyWorkup.tsx

import { STUDENT } from "../../../routes.ts";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function BackToWeeklyWorkup() {
	const navigate = useNavigate();
	return (
		<button
			type="button"
			onClick={() => navigate(STUDENT)}
			className="inline-flex gap-2 rounded-lg px-3 py-2 text-sm font-medium"
		>
			<ArrowLeft size={18} />
			<span>Back to Weekly Workups</span>
		</button>
	);
}
