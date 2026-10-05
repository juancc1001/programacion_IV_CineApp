# CineApp

TP 1 Programacion IV — Carvallo Juan Cruz

Aplicacion web de cine que permite a los usuarios explorar la cartelera, seleccionar butacas y comprar entradas, y a los administradores gestionar peliculas, salas, funciones y productos desde un backoffice.

## Stack tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | Angular 22 (standalone components no modules) |
| Estilos | SCSS |
| Backend / BaaS | Supabase (Auth, Database, Storage) |
| PWA | `@angular/service-worker` |
| Testing | Vitest |
| Tipos DB | Auto-generados con `supabase gen types` |

## Arquitectura

```
src/app/
├── pages/              # Paginas (lazy-loaded en todas las rutas)
│   ├── home/           # Cartelera publica
│   ├── login/          # Autenticacion
│   ├── carrito/        # Carrito de compras
│   ├── compra-entradas-modal/  # Modal de seleccion de funcion y butacas
│   └── backoffice/     # Panel admin (protegido por roleGuard)
│       ├── peliculas/
│       ├── salas/
│       ├── funciones/
│       └── productos/
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
│   ├── carrito.service.ts     # utiliza localStorage para guardarse en la sesión actual
│   └── modal.service.ts       # Modales dinamicos
├── guards/
│   └── role.guard.ts   # Guard dinamico por rol
├── directives/
│   └── is-admin.ts     # Directiva estructural *isAdmin
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

