# CineApp

TP 1 Programacion IV — Carvallo Juan Cruz

Aplicacion web de cine que permite a los usuarios explorar la cartelera, seleccionar butacas y comprar entradas, y a los administradores gestionar peliculas, salas, funciones y productos desde un backoffice.

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | Angular 22 (standalone components no modules) |
| Estilos | SCSS |
| Backend / BaaS | Supabase (Auth, Database, Storage) |
| Base de datos | PostgreSQL (vía Supabase) |
| PWA | `@angular/service-worker` |
| Testing | Vitest |
| Tipos DB | Auto-generados con `supabase gen types` |

## Arquitectura

```
src/app/
├── pages/              # Paginas (lazy-loaded en todas las rutas)
│   ├── home/           # Cartelera publica
│   ├── login/          # Autenticacion
│   ├── register/
│   ├── pelicula/       # Detalle de pelicula y reseñas
│   ├── candy/          # Productos del candy
│   ├── carrito/        # Carrito de compras
│   ├── canjes/         # Canje de entradas y productos con puntos
│   ├── usuario/        # Perfil: reservas, canjes y reseñas del usuario
│   ├── compra-entradas-modal/  # Modal de seleccion de funcion y butacas
│   └── backoffice/     # Panel admin (protegido por roleGuard)
│       ├── dashboard/  # Rankings y log de acciones
│       ├── peliculas/
│       ├── salas/
│       ├── funciones/
│       ├── productos/
│       ├── vouchers/
│       └── precios/    # Precios de entradas (standard / vip)
├── ui/                 # Componentes reutilizables
│   ├── navbar/
│   ├── button/
│   ├── input/
│   ├── multiselect/
│   └── mapa-sala/      # Mapa interactivo de butacas
├── services/           # Servicios (un service por entidad)
│   ├── supabase.service.ts    # Cliente Supabase tipado
│   ├── auth.service.ts        # Auth + info de usuario
│   ├── peliculas.service.ts
│   ├── salas.service.ts
│   ├── funciones.service.ts
│   ├── productos.service.ts
│   ├── precios.service.ts
│   ├── voucher.service.ts
│   ├── booking.service.ts     # Reservas (entradas + productos)
│   ├── reviews.service.ts
│   ├── dashboard.service.ts   # Peliculas mas vistas / productos mas vendidos
│   ├── log.service.ts         # Log de acciones del backoffice
│   ├── carrito.service.ts     # utiliza localStorage para guardarse en la sesión actual
│   └── modal.service.ts       # Modales dinamicos
├── guards/
│   └── role.guard.ts   # Guard dinamico por rol
├── directives/
│   ├── is-admin.ts     # Directiva estructural *isAdmin
│   └── edad-minima.ts  # Directiva estructural *edadMinima
└── assets/

src/types/              # Tipos compartidos
├── supabase.ts         # Auto-generado desde la DB
├── roles.ts
├── genero-pelicula.ts
├── formato-pelicula.ts
└── ...
```

### Patron de servicios

Cada entidad del dominio (peliculas, salas, funciones, productos) tiene su propio servicio Angular que encapsula las queries a Supabase. Todos inyectan `SupabaseService`, que expone un unico cliente tipado con `Database` generado automaticamente.

### Autenticacion y autorizacion

- **Auth**: Supabase Auth con email/password. Al registrarse se crea un registro en `user_information` con rol `Client` por defecto.
- **Guard**: `roleGuard(Roles.Admin)` protege las rutas del backoffice usando `canMatch`. Es una factory function que genera el guard con el rol requerido.
- **Directiva**: `*isAdmin` es una directiva estructural reactiva (usa `effect()`) que muestra/oculta contenido segun el rol del usuario.
- **`is_admin()`**: funcion propia en PostgreSQL (no viene con Supabase) que devuelve `true` si el usuario logueado (`auth.uid()`) tiene `role = Admin` en `user_information`. Se usa en las politicas RLS para que solo los admins puedan escribir en tablas como `prices`.

### Estado reactivo

Se usan **Angular Signals** en lugar de RxJS para el manejo de estado local:
- `CarritoService.items` — signal con los items del carrito
- `AuthService.userInformation` — signal con la info del usuario logueado
- `ModalService.activeModal` — signal con el componente modal activo

## Decisiones tecnicas

### Supabase como BaaS
Se eligio Supabase en lugar de un backend custom para simplificar la infraestructura. Supabase provee auth, base de datos PostgreSQL, storage para imagenes de peliculas, y un SDK tipado para el frontend. Los tipos se auto-generan con:

```bash
npm run supabase:types
```

### Tipos auto-generados
El script `supabase:types` ejecuta `supabase gen types typescript` y genera `src/types/supabase.ts`. Esto da type-safety end-to-end: los services usan `Tables<'movies'>`, `TablesInsert<'movies'>`, etc., de modo que cualquier cambio en el schema de la DB se refleja en el frontend al regenerar los tipos.

### Row Level Security (RLS)
Las tablas tienen RLS activado en PostgreSQL, asi que los permisos se validan en la base y no solo en el frontend. Las politicas de escritura usan `is_admin()`.

Ejemplo `prices`: todos pueden leer (el carrito muestra precios sin sesion) y solo los admins pueden crear y editar. No hay politica de `delete`, por lo que nadie puede borrar desde la app.

```sql
alter table prices enable row level security;

create policy "prices_select_todos" on prices for select
  to anon, authenticated using (true);

create policy "prices_insert_admin" on prices for insert
  to authenticated with check (is_admin());

create policy "prices_update_admin" on prices for update
  to authenticated using (is_admin()) with check (is_admin());
```

### Log de acciones
`LogService.registrar()` guarda en la tabla `Log` las acciones de los admins en el backoffice (crear/editar peliculas, salas, funciones, productos, vouchers y precios), con el nombre del usuario. En las ediciones de precios, vouchers y productos se agrega el JSON con los datos guardados, para saber exactamente que se cambio. El dashboard muestra los logs del mas nuevo al mas viejo.

```
Juan Carvallo editó el precio 'vip': {"label":"vip","price":12000,"points":800}
```

### Lazy loading en todas las rutas
Todas las paginas se cargan con `loadComponent()` para optimizar el bundle inicial. El backoffice usa rutas hijas lazy tambien.

### Mapa de sala interactivo
El componente `MapaSala` genera un layout de butacas con filas (A-S), divididas en bloques (lateral izquierdo, centro, lateral derecho). La fila J es especial: tiene menos butacas y esta designada como fila accesible para personas con discapacidad.

### Validacion de conflictos de funciones
Al crear o editar una funcion, `FuncionesService.validateFuncion()` verifica que no haya conflictos de horario en la misma sala, respetando un gap minimo de 30 minutos entre funciones.

### Carrito con persistencia localStorage
`CarritoService` persiste los items en `localStorage`, con un check de `isPlatformBrowser` para evitar errores en SSR.

### Modal service generico
`ModalService` recibe un `Type<unknown>` y lo renderiza dinamicamente, permitiendo abrir cualquier componente como modal sin acoplamiento.

### PWA
La app tiene Service Worker habilitado (`@angular/service-worker`) con registro diferido de 30 segundos para no afectar la carga inicial.

## Development server

```bash
ng serve
```

Abrir `http://localhost:4200/`.

## Build

```bash
ng build
```

## Tests

```bash
ng test
```

# Requisitos funcionales:

