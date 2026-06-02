interface Props {
  riesgo: number;
}

export default function RiesgoBar({
  riesgo,
}: Props) {

  return (
    <div className="space-y-2">

      <div className="flex justify-between">
        <span>Riesgo</span>
        <span>{riesgo}%</span>
      </div>

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

        <div
          className="h-full bg-red-500 transition-all"
          style={{
            width: `${Math.min(riesgo, 100)}%`,
          }}
        />

      </div>

    </div>
  );
}