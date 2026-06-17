interface Props {
  estado: string;
}

export default function EstadoBadge({
  estado,
}: Props) {

  const colors: Record<string, string> = {
    SANO: 'bg-green-500',
    HERIDO: 'bg-yellow-500',
    ENFERMO: 'bg-orange-500',
    INFECTADO: 'bg-red-600',
    AGOTADO: 'bg-purple-500',
    MUERTO: 'bg-gray-800',
  };

  return (
    <span
      className={`
        px-3
        py-1
        rounded-full
        text-white
        text-sm
        font-semibold
        ${colors[estado] || 'bg-gray-500'}
      `}
    >
      {estado}
    </span>
  );
}