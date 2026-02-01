import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'space-between',
  }),
  lastNextDiv: css({
    width: '260px',
    display: 'flex',
    justifyContent: 'space-between',
  }),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3),
  }),
  textFieldFormGroup: css({
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  }),
  fieldGroup: css({
    display: 'flex',
    alignItems: 'center',
  }),
  fieldHint: css({
    margin: theme.spacing(1, 0),
  }),
  tags: css({
    marginTop: theme.spacing(1),
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  }),
  flexGrow: css({
    flexGrow: 1,
  }),
  dateField: css({
    '& + &': {
      marginLeft: theme.spacing(2),
    },
  }),
  isAvailableForSaleDiv: css({
    margin: '14px 0',
  }),
  colorPicker: css({
    boxSizing: 'content-box',
    padding: '20px 12px 12px 20px',
    border: '1px solid #92929F',
    zIndex: '999',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgb(63 63 68 / 15%)',
  }),
  fixedBg: css({
    width: '100vw',
    height: '100vh',
    top: '0',
    left: '0',
    position: 'fixed',
    zIndex: '998',
  }),
}
