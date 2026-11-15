import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { moveLegacyBarMintLink } from './app/legacy-links'
import { Shell } from './app/shell'

moveLegacyBarMintLink()
bootstrapApplication(Shell, appConfig).catch((err) => console.error(err))
