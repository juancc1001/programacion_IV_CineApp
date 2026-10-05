## Requerimientos no funcionales

- Concurrencia y Tiempo Real: El sistema debe soportar actualizaciones en tiempo real y manejar la concurrencia, específicamente para bloquear y mostrar butacas ocupadas en el momento exacto en que múltiples usuarios intentan comprar al mismo tiempo.

- Seguridad y Privacidad: Manejo seguro de datos personales y gestión de sesiones. Protección de datos recopilados (mail, nombre, tipo de sangre, etc.) y segmentación de permisos según roles.

- Rendimiento: Optimización de tiempos de carga para garantizar fluidez crítica en la renderización del mapa de butacas y el procesamiento en la pasarela de pagos.

- El estilo visual de la aplicación debe ser único y producido.

- Usabilidad: Las interfaces deben ser intuitivas, fáciles de navegar y de entender tanto para los clientes como para los empleados.

- Restricciones de Interfaz: Prohibición estricta de utilizar selectores de fechas (Date Pickers) engorrosos que demanden mucho tiempo de búsqueda.

## Requerimientos Funcionales

### 1. Interfaz del Cliente (Home y Exploración)
- La página principal debe mostrar en primer lugar las 3 películas más vendidas.
- El listado de películas debe incorporar un buscador.
- El buscador debe permitir filtrar las películas por el género de las mismas.
- El sistema debe soportar que cada película tenga varios géneros asignados.
- Debe existir una sección de "Próximamente" dedicada a las películas que se estrenan en las próximas semanas.
- Los usuarios deben poder activar alertas para recibir notificaciones cuando las entradas de la sección "Próximamente" estén disponibles para la venta.

### 2. Catálogo de Películas y Reseñas
- Toda película debe registrar una duración, una imagen, un nombre y una sinopsis.
- El sistema de reseñas debe permitir a los usuarios calificar con estrellas cada película y dejar un comentario corto.
- Las reseñas de los usuarios deben ser visibles en la plataforma antes de que se proceda a sacar las entradas.
- El sistema debe calcular automáticamente y mostrar la puntuación promedio de cada película.
- El sistema debe gestionar restricciones de edad por película (18 años, 13 años o sin restricción) y prohibir la compra a los usuarios que no cumplan con la edad.
- Toda entrada comprada para una película con restricción de edad debe incluir una aclaración indicando que debe asistir un adulto.

### 3. Sistema de Compras y Entradas
- El sistema debe permitir a los clientes realizar compras siendo anónimos.
- El usuario debe poder elegir si la película está en formato 2D, 3D, 4D o 5D, y si está en castellano o subtitulada.
- El sistema de preventa debe permitir abrir la venta de entradas 7 días antes del estreno con un precio especial, regresando al precio normal una vez pasada la fecha de preventa.
- El sistema debe generar un archivo PDF con los datos de la entrada y un código QR que se presentará para ingresar.
- El sistema debe permitir que los usuarios cancelen una compra hasta 2 horas antes de la función.
- Las cancelaciones no devuelven dinero, sino que deben otorgar crédito en la cuenta del usuario para futuras compras, pudiendo usarse junto con otros métodos de pago.

### 4. Gestión de Salas y Butacas
- Las salas deben estructurarse siempre con 20 filas numeradas con letras y 3 columnas con 4, 20 y 4 butacas.
- El mapa debe mostrar la disponibilidad en tiempo real, evidenciando cuáles butacas están ocupadas por otra compra en ese mismo momento.
- Las filas J y K deben estar adaptadas para personas con discapacidad (2, 10 y 2 butacas por columna) y deben resaltarse visualmente de forma diferente.
- Las últimas 3 filas de cada sala (R, S y T) deben configurarse como butacas VIP con un precio más alto, resaltarse visualmente en el mapa y avisar claramente al usuario de su condición antes de pagar.

### 5. Usuarios Registrados y Fidelización
- El registro de usuarios debe solicitar: mail, nombre, apellido, fecha de nacimiento, tipo de sangre, color de ojos y cantidad de días de vacaciones por año.
- El registro otorga automáticamente un cupón de 20% de descuento aplicable a la primera compra.
- El programa de fidelización debe sumar 1 punto por cada peso gastado en compras de usuarios registrados.
- Los puntos deben poder canjearse por entradas gratis o productos del candy bar y el sistema debe impedir su transferencia entre usuarios.
- El perfil de usuario debe mostrar los puntos acumulados y el historial de canjes realizados.
- El perfil debe incluir una sección "Mis películas" que muestre un historial visual de lo visto, incluyendo pósters, fechas y la propia calificación del usuario.

### 6. Candy Bar
- El sistema debe contar con un sector de candy para comprar productos (pochoclos, bebidas, etc.) organizados en categorías junto con la entrada.
- Los productos comprados deben asociarse al mismo QR de la entrada para ser retirados mediante un único escaneo.
- Se deben ofrecer combos especiales (entrada + pochoclos + bebida) a un precio fijo configurado, los cuales deben aparecer destacados en la página de compra.

### 7. Panel de Administración (Backoffice)
- El motor de asignación de salas debe ser automático, garantizando que bajo ningún término dos funciones ocurran en la misma sala al mismo tiempo.
- El sistema debe bloquear la programación de funciones si no ha pasado al menos media hora desde que terminó la función anterior en esa sala.
- El administrador debe poder configurar qué películas y en qué horarios aparecen cuando se entra a la página.
- El administrador debe poder modificar el porcentaje del cupón de descuento de primera compra.
- El administrador debe poder crear cupones de descuento que apliquen únicamente a usuarios mayores de 50 años.
- El administrador debe poder configurar la cantidad de puntos necesarios para canjear cada recompensa, los precios de los combos y si las películas aplican a preventa.
- El panel debe incluir un reporte diario que indique cuánto se facturó y cuántas entradas se vendieron, con opción a exportarlo a PDF y Excel.
- El panel debe incluir gráficos visuales de las películas más vistas por semana y mes, y del producto más vendido del candy bar.
- El panel debe contar con un log de actividad que registre con fecha y hora quién creó cada función, quién modificó precios y quién validó códigos QR.

### 8. Empleados y Validación (Control de Acceso)
- Debe existir un acceso de usuario para empleados que permita escanear los QRs para validar entradas y entregar comida del Candy bar.
- La interfaz de validación debe contar con una opción para ingresar el código manualmente en caso de que el lector no funcione.
- El sistema debe invalidar el código QR automáticamente una vez que una entrada se valida o se entrega la comida, impidiendo que funcione de nuevo.