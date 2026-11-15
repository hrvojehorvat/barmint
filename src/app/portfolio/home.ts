import { ChangeDetectionStrategy, Component } from '@angular/core'
import { SITE } from '../../site'
import { ProjectCard } from './project-card'
import { PROJECTS } from './projects'

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectCard],
  host: { class: 'block' },
  template: `
    <section class="pt-16 sm:pt-24 pb-14">
      <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">{{ name }}</p>
      <h1 class="mt-3 max-w-3xl text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
        Software development
        <span class="bg-gradient-to-r from-neutral-500 to-neutral-400 dark:from-neutral-400 dark:to-neutral-600 bg-clip-text text-transparent">
          and AI.
        </span>
      </h1>
      <div class="mt-6 max-w-2xl space-y-4 text-base sm:text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
        <p>
          I enjoy building software that is fast, focused and easy to use: small tools that do one job well and
          respect the people using them.
        </p>
        <p>
          I'm especially interested in AI: how it changes the way software gets built, and where it genuinely makes
          products better. This site collects the things I build along the way.
        </p>
      </div>
    </section>

    <section aria-labelledby="projects-title">
      <h2 id="projects-title" class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400 dark:text-neutral-500 mb-4">
        Projects
      </h2>
      <div class="grid gap-6 md:grid-cols-2">
        @for (p of projects; track p.slug) {
          <app-project-card [project]="p" />
        }
      </div>
    </section>
  `,
})
export class Home {
  protected readonly name = SITE.name
  protected readonly projects = PROJECTS
}
