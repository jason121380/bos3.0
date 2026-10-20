import { colors } from 'ui/colors'

export default {
  styleOverrides: {
    root: {
      backgroundColor: 'rgba(0, 0, 0, 0.05) !important',
      color: '#000000 !important',
      borderRadius: '10px !important'
    },
    deletable: {
      '&:focus': {
        backgroundColor: colors.blueGrey[100],
      },
    },
  }
}
