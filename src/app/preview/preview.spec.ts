import { render, screen } from '@testing-library/angular'
import { describe, expect, it } from 'vitest'
import { dicts } from '../../i18n'
import type { RenderOptions } from '../../lib/render'
import { CANVAS_RENDERER } from '../canvas-renderer'
import { Preview } from './preview'

const t = dicts.en
const opts = { bcid: 'qrcode', text: 'x' } as RenderOptions

describe('Preview', () => {
  it('drops an old render error once there is nothing to render', async () => {
    const view = await render(Preview, {
      inputs: { opts, filename: 'code', t },
      providers: [
        {
          provide: CANVAS_RENDERER,
          useValue: () => {
            throw new Error('bwipp.boom: too long')
          },
        },
      ],
    })
    await view.fixture.whenStable()
    expect(screen.getByText(new RegExp(`^${t.renderError}`))).toBeInTheDocument()

    view.fixture.componentRef.setInput('opts', null)
    await view.fixture.whenStable()
    expect(screen.queryByText(new RegExp(`^${t.renderError}`))).toBeNull()
    expect(screen.getByText(t.empty)).toBeInTheDocument()
  })
})
