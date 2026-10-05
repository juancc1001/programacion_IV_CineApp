import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // la sesión de Supabase vive en localStorage, el guard solo puede correr en el browser
  { path: 'backoffice', renderMode: RenderMode.Client },
  { path: 'backoffice/**', renderMode: RenderMode.Client },
  { path: 'pelicula/:id', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
