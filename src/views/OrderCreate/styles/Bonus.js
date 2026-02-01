import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  bonus: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: 20
  }),
  field: css({
    width: '200px',
    display: 'flex',
    justifyContent: 'flex-start',
  })
}
