import { css } from '@emotion/react'

export default {
  serviceInputGroup: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    width: '190px',
  }),
  field: css({
    width: '150px',
    display: 'flex',
    marginLeft: '12px',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  action: css({
    width: '50px',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
}
