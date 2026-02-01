import palette from '../palette'
import typography from '../typography'

export default {
  styleOverrides: {
    root: {
      ...typography.body1,
      borderBottom: `1px solid ${palette.divider}`,
    },
    head: {
      color: palette.text.secondary,
      fontSize: '14px',
      fontWeight: 'bold',
    },
    body: {
      fontSize: '14px',
    },
  }
}
