// file: src/pages/admin/statistics/StatisticsPage.tsx

import FacultyViewer from "./facultyViewer/FacultyViewer";

export default function StatisticsPage() {
	return (
		<div className="w-4/5 mx-auto">
			<div className="py-5">
				<h1 className="text-lg font-semibold text-primary">Statistics & Insights</h1>
				<p className="text-sm text-muted">
					Browse feedback summary for by disease and answer type.
				</p>
			</div>
			<FacultyViewer />
		</div>
	);
}
