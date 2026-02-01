import palette from '../palette'

export default {
  styleOverrides: {
    root: {
      '&.Mui-selected': {
        backgroundColor: palette.background.default,
      },
      '&.Mui-hover': {
        '&:hover': {
          backgroundColor: palette.background.default,
        },
      },
    },
  }
}
