import palette from '../palette'

export default {
  styleOverrides: {
    root: {
      color: palette.icon,
      padding: '7px !important',
      border: '1px solid rgba(0, 0, 0, 0.12) !important',
      '&:hover': {
        backgroundColor: 'rgba(208, 208, 208, 0.20)',
      },
      // '&.Mui-selected': {
      //   backgroundColor: 'rgba(208, 208, 208, 0.20)',
      //   color: palette.primary.main,
      //   '&:hover': {
      //     backgroundColor: 'rgba(208, 208, 208, 0.30)',
      //   },
      // },
      '&:first-of-type': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      },
      '&:last-child': {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
    },
  }
}
