import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { redirectIfMoved } from './app/redirects'
import { Shell } from './app/shell'

if (!redirectIfMoved()) bootstrapApplication(Shell, appConfig).catch((err) => console.error(err))
