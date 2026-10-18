import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  couponSells: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '150px',
    display: 'flex',
    marginRight: '12px',
  }),
  fieldWidth: css({
    width: '250px',
    display: 'flex',
    marginRight: '12px',
  }),
  priceField: css({
    width: '65px',
    display: 'flex',
    marginRight: '12px',
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
    width: '22px',
    height: '22px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '6px',
    marginBottom: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    color: 'rgb(var(--text-tertiary))',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  createIcon: css({
    cursor: 'pointer',
    margin: '0 6px 6px 6px',
    fontSize: '18px',
    color: 'rgb(var(--text-tertiary))',
  }),
}
