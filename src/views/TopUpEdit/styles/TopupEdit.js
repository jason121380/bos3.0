import red from '@mui/material/colors/red'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({
    padding: theme.spacing(3),
  }),
  deleteButton: css({
    backgroundColor: red[700] + '!important',
    '&:hover, &:active': {
      backgroundColor: red[600] + '!important',
    },
    color: '#fff'
  }),
}
