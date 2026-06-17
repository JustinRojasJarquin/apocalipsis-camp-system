import type { Persona } from "../types";
import {
  CrudAction,
  CrudActionGroup,
  CrudActions,
} from "../../../shared/components/CrudActions";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface Props {
  personas: Persona[];
  loading: boolean;
  deletingId: number | null;
  onView: (persona: Persona) => void;
  onEdit: (persona: Persona) => void;
  onDelete: (persona: Persona) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";

  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (!match) return "Sin fecha";

  const [, year, month, day] = match;
  return `${Number(day)}/${Number(month)}/${year}`;
};

export default function PersonaTabla({
  personas,
  loading,
  deletingId,
  onView,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return <div className="empty-state">Cargando personas...</div>;
  }

  if (personas.length === 0) {
    return (
      <div className="empty-state">
        No hay personas activas registradas en el sistema.
      </div>
    );
  }

  return (
    <div className="personas-table-wrapper">
      <table className="personas-table">
        <thead>
          <tr>
            <th>Persona</th>
            <th>Cedula</th>
            <th>Campamento</th>
            <th>Cargo</th>
            <th>Estado</th>
            <th>Codigo</th>
            <th>Nacimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {personas.map((persona) => (
            <tr key={persona.id_persona}>
              <td>
                <strong>
                  {persona.nombre} {persona.apellidos}
                </strong>
              </td>

              <td>{persona.cedula}</td>

              <td>
                {persona.campamento?.nombre ?? `#${persona.id_campamento}`}
              </td>

              <td>{persona.cargo?.nombre ?? "Sin cargo"}</td>

              <td>{persona.estado_persona?.nombre ?? "Sin estado"}</td>

              <td>{persona.codigo_campamento?.trim() || "Sin codigo"}</td>

              <td>{formatDate(persona.fecha_nacimiento)}</td>

              <td>
                <CrudActions layout="table">
                  <CrudActionGroup>
                    <CrudAction
                      label="Ver"
                      icon={Eye}
                      onClick={() => onView(persona)}
                    />
                    <CrudAction
                      label="Editar"
                      icon={Pencil}
                      variant="primary"
                      onClick={() => onEdit(persona)}
                    />
                  </CrudActionGroup>
                  <CrudActionGroup>
                    <CrudAction
                      label={
                        deletingId === persona.id_persona
                          ? "Eliminando..."
                          : "Eliminar"
                      }
                      icon={Trash2}
                      variant="danger"
                      disabled={deletingId === persona.id_persona}
                      loading={deletingId === persona.id_persona}
                      onClick={() => onDelete(persona)}
                    />
                  </CrudActionGroup>
                </CrudActions>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
