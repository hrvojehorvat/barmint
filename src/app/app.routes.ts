import type { Routes } from '@angular/router'
import { SITE } from '../site'
import { Home } from './portfolio/home'
import { PortfolioLayout } from './portfolio/layout'
import { ProjectsPage } from './portfolio/projects-page'

export const routes: Routes = [
  {
    path: '',
    component: PortfolioLayout,
    children: [
      { path: '', component: Home, title: `${SITE.name} · Software development & AI` },
      { path: 'projects', component: ProjectsPage, title: `Projects · ${SITE.name}` },
      {
        path: 'plumcast',
        loadComponent: () => import('./plumcast/plumcast').then((m) => m.Plumcast),
        title: 'Plumcast · IPTV player for Android TV, Fire TV and phones',
      },
    ],
  },
  // Projects are lazy-loaded: the portfolio doesn't download their code (BarMint brings bwip-js).
  {
    path: 'barmint',
    loadComponent: () => import('./barmint/barmint').then((m) => m.BarMint),
    title: 'BarMint · GiroCode, EPC QR & Swiss QR-bill generator',
  },
  { path: '**', redirectTo: '' },
]
