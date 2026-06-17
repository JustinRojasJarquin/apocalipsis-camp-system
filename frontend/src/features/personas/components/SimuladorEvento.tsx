interface Props {
  onEvento: (estadoId: number) => void;
}

export default function SimuladorEvento({
  onEvento,
}: Props) {

  return (
    <div
      className="
        bg-white
        rounded-xl
        p-5
        shadow-md
        space-y-4
      "
    >

      <h2 className="text-xl font-bold">
        Simulador de eventos
      </h2>

      <div className="grid grid-cols-2 gap-3">

        <button
          className="bg-yellow-500 text-white p-3 rounded-lg"
          onClick={() => onEvento(2)}
        >
          Herida en exploración
        </button>

        <button
          className="bg-orange-500 text-white p-3 rounded-lg"
          onClick={() => onEvento(3)}
        >
          Enfermedad
        </button>

        <button
          className="bg-red-600 text-white p-3 rounded-lg"
          onClick={() => onEvento(4)}
        >
          Mordida zombie
        </button>

        <button
          className="bg-purple-600 text-white p-3 rounded-lg"
          onClick={() => onEvento(5)}
        >
          Fatiga extrema
        </button>

      </div>

    </div>
  );
}