type Props = { value: string };

export default function OutputPanel({ value }: Props) {
  return (
    <div className="rounded-lg border border-orange-300">
      <div className="border-b border-orange-300 bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
        Output
      </div>
      <div className="p-4">
        <div className="h-200 overflow-auto rounded-md bg-orange-50 p-3 text-sm text-gray-800">
          {value ? value : "Output will appear here after processing..."}
        </div>
      </div>
    </div>
  );
}
