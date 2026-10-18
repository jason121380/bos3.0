import { css } from '@emotion/react'

export default {
  serviceInputGroup: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  }),
  field: css({
    width: '100px',
    display: 'flex',
    marginLeft: '12px',
    '& input': {
      padding: '6px 0px 7px !important'
    }
  }),
  smallField: css({
    width: '60px',
    display: 'flex',
    marginLeft: '12px',
    marginBottom: '12px'
  }),
  isUsing: css({
    marginLeft: '20px',
  }),
  gap: css({
    marginBottom: '20px',
  }),
  icon: css({
    cursor: 'pointer',
    marginLeft: '50px',
  }),
  title: css({
    width: '80px',
  }),
  colorTag: css({
    marginLeft: '10px',
    height: '40px',
    border: '1px solid rgb(var(--border-strong))',
  }),
  fixedBg: css({
    width: '100vw',
    height: '100vh',
    top: '0',
    left: '0',
    position: 'fixed',
    zIndex: '998',
  }),
  colorPicker: css({
    boxSizing: 'content-box',
    padding: '20px 12px 12px 20px',
    border: '1px solid rgb(var(--border-strong))',
    zIndex: '999',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgb(63 63 68 / 15%)',
  }),
}
