import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucideArrowUpRight } from '@lucide/angular'
import { BarMintLogo } from '../barmint/logo'
import { Card } from '../ui/card'
import type { Project } from './projects'

/** Project tile. Wears the project's own accent colour. */
@Component({
  selector: 'app-project-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BarMintLogo, Card, RouterLink, LucideArrowUpRight],
  host: { class: 'block' },
  template: `
    @let p = project();
    <a
      appCard
      [routerLink]="['/', p.slug]"
      [class]="p.theme"
      class="group h-full p-6 sm:p-7 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_50px_-16px_rgba(0,0,0,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500"
    >
      <span class="flex items-start justify-between gap-4">
        @switch (p.logo) {
          @case ('barmint') {
            <app-barmint-logo class="h-11 w-11" />
          }
          @default {
            <span
              aria-hidden="true"
              class="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-accent-300 to-accent-600 shadow-[0_6px_18px_-6px_var(--color-accent-500)]"
            ></span>
          }
        }
        <svg
          lucideArrowUpRight
          class="h-5 w-5 text-neutral-300 transition group-hover:text-accent-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        ></svg>
      </span>
      <span class="mt-5 block text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">{{ p.name }}</span>
      <span class="mt-0.5 block text-sm font-medium text-accent-600 dark:text-accent-400">{{ p.tagline }}</span>
      <span class="mt-3 block text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">{{ p.description }}</span>
      <span class="mt-5 flex flex-wrap gap-1.5">
        @for (tag of p.tags; track tag) {
          <span
            class="rounded-full bg-black/[0.05] dark:bg-white/10 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300"
          >
            {{ tag }}
          </span>
        }
      </span>
    </a>
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>()
}
