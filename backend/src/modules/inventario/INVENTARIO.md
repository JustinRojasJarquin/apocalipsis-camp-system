Endpoints del módulo Inventario

Rutas (asumiendo prefijo `/inventario`):

- GET /resources
  - Query: `campamento` (opcional)
  - Obtiene recursos del inventario por campamento.

- GET /recursos
  - Lista recursos disponibles (catalogo).

- POST /resources
  - Crea una entrada de inventario en un campamento.
  - Payload: { "campId": number, "resourceId": number, "quantity": number, "minThreshold": number }

- PUT /resources/:campId/:resourceId
  - Actualiza cantidad o minimo_alerta.
  - Payload: { "quantity": number, "minThreshold": number }

- DELETE /resources/:campId/:resourceId
  - Elimina el registro de inventario.

Nuevos endpoints para producción y raciones:

- POST /produccion
  - Registra una `produccion_diaria` y actualiza inventario.
  - Payload: {
    "fecha": "YYYY-MM-DD" (opcional),
    "personaId": number,
    "campId": number,
    "resourceId": number,
    "cantidad": number,
    "ajusteRazon": string (opcional),
    "observaciones": string (opcional)
  }
  - Comportamiento: crea registro en `produccion_diaria`, suma `cantidad` al `inventario_campamento` (crea registro si no existe) y agrega un `inventario_movimiento` con `tipo = PRODUCCION`.

- POST /racion
  - Registra una `racion_diaria` (consumo) y actualiza inventario.
  - Payload: { "fecha": "YYYY-MM-DD" (opcional), "personaId": number, "campId": number, "resourceId": number, "cantidad": number }
  - Comportamiento: valida stock disponible en `inventario_campamento`, crea `racion_diaria`, resta `cantidad` del inventario y agrega `inventario_movimiento` con `tipo = RACION`. Si no hay suficiente inventario, retorna error.

- POST /recalculate/:campId
  - Recalcula inventario para la fecha proporcionada (en body: `{ "date": "YYYY-MM-DD" }`) o para hoy si no se proporciona.
  - Comportamiento: agrega producciones y resta raciones del día al inventario actual para cada recurso involucrado. Retorna un resumen por recurso con `produced`, `consumed`, `before`, `after`.

Notas de implementación:
- Todas las operaciones críticas usan transacciones Prisma (`$transaction`).
- Los tipos de movimiento usados: `PRODUCCION`, `RACION`.
- Para `createRacion` se bloquea la operación si el inventario es insuficiente.

Siguientes pasos sugeridos:
- Añadir pruebas automatizadas para los flujos de producción, ración y recálculo.
- Ajustar el frontend para exponer estos endpoints y mostrar notificaciones de éxito/error.
