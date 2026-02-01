import { css } from '@emotion/react'

export default {
  serviceInputGroup: css({
    display: 'flex',
    alignItems: 'center',
    '& .MuiCardActions-root': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 20
    }
  }),
  field: css({
    width: '150px',
    display: 'flex',
    marginLeft: '0px !important'
  }),
}
