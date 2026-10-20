import { colors } from 'ui/colors'
import palette from '../palette'

export default {
  styleOverrides: {
    root: {
      '& .MuiButton-containedPrimary': {
        boxShadow: '0 1px 1px 0 rgba(0,0,0,0.14)',
        borderColor: 'unset',
        backgroundColor: 'white !important',
        color: palette.text.primary + '!important',
        padding: '6px 16px !important',
        '&:hover': {
          backgroundColor: colors.grey[200] + '!important',
        },
      },
      }
  }
}
