import palette from '../palette'

export default {
  styleOverrides: {
    root: {
      '&.Mui-selected': {
        backgroundColor: palette.background.default,
      },
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
    },
  }
}
