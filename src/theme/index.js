import { createTheme } from '@mui/material/styles'

import components from './overrides'
import palette from './palette'
import typography from './typography'
const baseTheme = {
  palette,
  typography,
  components,
}

export const theme = createTheme(baseTheme)
export const themeWithRtl = createTheme({ ...baseTheme, direction: 'rtl' })
