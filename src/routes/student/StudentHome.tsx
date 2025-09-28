// src/routes/student/StudentHome.tsx
export default function StudentHome() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold">
        Dashboard
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-700">
          Welcome! This student view is a placeholder for now.
        </p>
        <div className="rounded-md border border-orange-300 bg-orange-100 px-3 py-2 text-sm text-orange-800">
          Coming soon: submit cases, view feedback, and history.
        </div>
      </div>
    </div>
  );
}
