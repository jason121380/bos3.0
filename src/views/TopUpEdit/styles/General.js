import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  card: css({
    margin: theme.spacing(3, 0, 3, 0),
    maxWidth: '500px',
  }),
  formControl: css({
    marginBottom: theme.spacing(3) + '!important',
  }),
  option: css({
    fontSize: 14,
    '& > span': {
      marginRight: 10,
      fontSize: 14,
    },
  }),
}
