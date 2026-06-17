type ErrorBody = any;

export function mapInventoryError(body: ErrorBody): string | null {
  if (!body) return null;

  // Raw string message
  if (typeof body === "string") return translateKnown(body);

  // Standard fields
  if (typeof body === "object") {
    const raw = body.message ?? body.mensaje ?? body.error ?? null;
    if (raw) return translateKnown(String(raw));

    // Common validation shape: { errors: [{ message: '...' }, ...] }
    if (Array.isArray(body.errors) && body.errors.length) {
      const msgs = body.errors.map((e: any) => translateKnown(e.message ?? e.mensaje ?? String(e))).join(", ");
      return msgs;
    }

    // Some backends return field-specific errors: { personaId: 'invalid' }
    const keys = Object.keys(body);
    for (const k of keys) {
      const v = body[k];
      if (typeof v === "string") {
        const t = translateKnown(v);
        if (t) return `${humanizeKey(k)}: ${t}`;
      }
      if (Array.isArray(v) && v.length && typeof v[0] === "string") {
        return `${humanizeKey(k)}: ${v.join(", ")}`;
      }
    }

    // If single-key object with nested message
    if (keys.length === 1 && typeof body[keys[0]] === "object") {
      const nested = body[keys[0]];
      if (nested.message) return translateKnown(String(nested.message));
    }
  }

  return null;
}

function translateKnown(text: string): string | null {
  const t = text.toLowerCase();

  // Known direct translations and patterns
  if (t.includes("personaid") || t.includes("personaid") || t.includes("persona id") || t.includes("personalid")) {
    return "La persona seleccionada no es válida. Verifica que hayas elegido una persona existente.";
  }

  if (t.includes("camp") && (t.includes("id") || t.includes("campamento"))) {
    return "El campamento seleccionado no es válido. Por favor selecciona un campamento existente.";
  }

  if (t.includes("recurso") || t.includes("resourceid") || t.includes("id_recurso")) {
    return "El recurso seleccionado no es válido. Verifica que exista el recurso.";
  }

  if (t.includes("insuficiente") || t.includes("insufficient") || t.includes("not enough") || t.includes("not enough stock")) {
    return "Inventario insuficiente para completar la operación.";
  }

  if (t.includes("invalid") || t.includes("invalid input") || t.includes("validation")) {
    return "Datos de entrada inválidos. Revisa los campos y vuelve a intentar.";
  }

  if (t.includes("not found") || t.includes("no encontrado") || t.includes("not exist") || t.includes("does not exist")) {
    return "Recurso no encontrado. Verifica los datos e intenta de nuevo.";
  }

  if (t.includes("unauthorized") || t.includes("token") || t.includes("permission")) {
    return "No autorizado. Inicia sesión nuevamente o verifica tus permisos.";
  }

  // Generic fallback: return the original text but in spanish-friendly phrasing
  // If text seems already user-friendly (short), return as-is
  if (text.length < 100) return capitalizeSentence(text);

  return null;
}

function humanizeKey(key: string): string {
  const map: Record<string, string> = {
    personaId: "Persona",
    personaid: "Persona",
    campId: "Campamento",
    camp_id: "Campamento",
    resourceId: "Recurso",
    recurso: "Recurso",
  };
  return map[key] ?? capitalizeSentence(key.replace(/[_\-]/g, " "));
}

function capitalizeSentence(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
