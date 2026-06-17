import EstadoBadge from './EstadoBadge';

import RiesgoBar from '../../personas/components/RiesgoBar';

interface Props {
  nombre: string;
  cargo: string;
  estado: string;
  riesgo: number;
}

export default function EstadoFisicoCard({
  nombre,
  cargo,
  estado,
  riesgo,
}: Props) {

  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-md
        p-5
        space-y-4
      "
    >

      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-bold">
            {nombre}
          </h2>

          <p className="text-gray-500">
            {cargo}
          </p>
        </div>

        <EstadoBadge estado={estado} />

      </div>

      <RiesgoBar riesgo={riesgo} />

    </div>
  );
}