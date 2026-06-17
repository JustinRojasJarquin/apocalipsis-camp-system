export function calcularNivelRiesgo(
  estado: string
): number {

  switch (estado) {

    case 'SANO':
      return 0;

    case 'AGOTADO':
      return 20;

    case 'HERIDO':
      return 40;

    case 'ENFERMO':
      return 60;

    case 'INFECTADO':
      return 100;

    case 'MUERTO':
      return 999;

    default:
      return 0;
  }
}