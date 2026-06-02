interface Props {
  explicacionIA: string;
}

export default function IARecommendationPanel({
  explicacionIA,
}: Props) {

  return (
    <div
      className="
        bg-zinc-900
        text-white
        rounded-xl
        p-5
        space-y-3
        border
        border-zinc-700
      "
    >

      <h2 className="text-xl font-bold">
        Recomendación IA
      </h2>

      <p className="leading-relaxed text-zinc-300">
        {explicacionIA}
      </p>

    </div>
  );
}