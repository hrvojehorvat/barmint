import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ProjectCard } from './project-card'
import { PROJECTS } from './projects'

@Component({
  selector: 'app-projects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectCard],
  host: { class: 'block' },
  template: `
    <section class="pt-16 sm:pt-24 pb-10">
      <h1 class="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">Projects</h1>
      <p class="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
        Things I've built. Each project has its own colour, the design stays the same.
      </p>
    </section>
    <div class="grid gap-6 md:grid-cols-2">
      @for (p of projects; track p.slug) {
        <app-project-card [project]="p" />
      }
    </div>
  `,
})
export class ProjectsPage {
  protected readonly projects = PROJECTS
}
