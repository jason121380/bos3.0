import palette from '../palette'

export default {
  styleOverrides: {
    root: {
      color: palette.icon,
      padding: '8px !important',
      borderRadius: '50% !important',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
  }
}
