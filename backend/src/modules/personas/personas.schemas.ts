import type { CreatePersonaDTO, UpdatePersonaDTO } from "./personas.dto";

const validateTextField = (
  value: string | undefined,
  fieldName: string,
  minLength = 2,
) => {
  if (value === undefined) {
    return;
  }

  if (value.trim() === "") {
    throw new Error(`El campo ${fieldName} no puede estar vacio`);
  }

  if (value.trim().length < minLength) {
    throw new Error(
      `El campo ${fieldName} debe tener al menos ${minLength} caracteres`,
    );
  }
};

const validateOptionalUrl = (
  value: string | null | undefined,
  fieldName: string,
) => {
  if (value === undefined || value === null || value.trim() === "") {
    return;
  }

  try {
    new URL(value);
  } catch {
    throw new Error(`El campo ${fieldName} debe contener una URL valida`);
  }
};

const validateOptionalId = (
  value: number | null | undefined,
  fieldName: string,
) => {
  if (value === undefined || value === null) {
    return;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`El campo ${fieldName} debe ser un numero entero positivo`);
  }
};

const validateOptionalDate = (value: string | null | undefined) => {
  if (value === undefined || value === null || value.trim() === "") {
    return;
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new Error("La fecha de nacimiento no es valida");
  }
};

export const validateCreatePersona = (data: CreatePersonaDTO) => {
  validateOptionalId(data.id_campamento, "id_campamento");

  if (!data.id_campamento) {
    throw new Error("El campamento es obligatorio");
  }

  validateTextField(data.cedula, "cedula");
  validateTextField(data.nombre, "nombre");
  validateTextField(data.apellidos, "apellidos");
  validateOptionalDate(data.fecha_nacimiento);
  validateOptionalUrl(data.foto_url, "foto_url");
  validateOptionalUrl(data.imagen_carnet_url, "imagen_carnet_url");
  validateOptionalId(data.id_cargo_actual, "id_cargo_actual");
  validateOptionalId(data.id_estado_actual, "id_estado_actual");

  if (
    data.codigo_campamento !== undefined &&
    data.codigo_campamento !== null &&
    data.codigo_campamento.trim() !== "" &&
    data.codigo_campamento.trim().length < 2
  ) {
    throw new Error("El codigo del campamento debe tener al menos 2 caracteres");
  }
};

export const validateUpdatePersona = (data: UpdatePersonaDTO) => {
  if (Object.keys(data).length === 0) {
    throw new Error("Debes enviar al menos un campo para actualizar");
  }

  validateOptionalId(data.id_campamento, "id_campamento");
  validateTextField(data.cedula, "cedula");
  validateTextField(data.nombre, "nombre");
  validateTextField(data.apellidos, "apellidos");
  validateOptionalDate(data.fecha_nacimiento);
  validateOptionalUrl(data.foto_url, "foto_url");
  validateOptionalUrl(data.imagen_carnet_url, "imagen_carnet_url");
  validateOptionalId(data.id_cargo_actual, "id_cargo_actual");
  validateOptionalId(data.id_estado_actual, "id_estado_actual");

  if (
    data.codigo_campamento !== undefined &&
    data.codigo_campamento !== null &&
    data.codigo_campamento.trim() !== "" &&
    data.codigo_campamento.trim().length < 2
  ) {
    throw new Error("El codigo del campamento debe tener al menos 2 caracteres");
  }
};
