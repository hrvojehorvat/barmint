import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { SITE } from '../../site'
import { MrvojeLogo } from './logo'

/** Portfolio frame: header with navigation, page content, footer. Neutral colours (no project accent). */
@Component({
  selector: 'app-portfolio-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MrvojeLogo, RouterLink, RouterLinkActive, RouterOutlet],
  host: { class: 'relative block min-h-screen overflow-x-hidden' },
  template: `
    <!-- ambient background -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10">
      <div
        class="absolute -top-48 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-neutral-300/50 via-neutral-200/30 to-transparent dark:from-white/[0.07] dark:via-white/[0.03] blur-3xl"
      ></div>
    </div>

    <header
      class="sticky top-0 z-20 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl"
    >
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <a
          routerLink="/"
          [attr.aria-label]="name + ' (home)'"
          class="group -mx-1 rounded-md px-1 py-1.5 text-neutral-900 dark:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
        >
          <app-mrvoje-logo class="h-[22px]" />
        </a>
        <nav aria-label="Main" class="flex items-center gap-1">
          <a
            routerLink="/projects"
            routerLinkActive="bg-black/[0.06] dark:bg-white/10 text-neutral-900 dark:text-white"
            ariaCurrentWhenActive="page"
            class="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            Projects
          </a>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
      <router-outlet />

      <footer class="mt-24 flex flex-col items-center gap-3 text-xs text-neutral-400 sm:flex-row sm:justify-between">
        <span>© {{ year }} {{ name }}</span>
        <nav aria-label="Legal" class="flex gap-4">
          <!-- Shared legal pages live in BarMint for now. -->
          <a href="/barmint#impressum" class="hover:text-neutral-700 dark:hover:text-neutral-200">Impressum</a>
          <a href="/barmint#datenschutz" class="hover:text-neutral-700 dark:hover:text-neutral-200">Privacy</a>
        </nav>
      </footer>
    </main>
  `,
})
export class PortfolioLayout {
  protected readonly name = SITE.name
  protected readonly year = new Date().getFullYear()

  constructor() {
    // The portfolio is English; BarMint may have switched the page language to German.
    document.documentElement.lang = 'en'
  }
}
