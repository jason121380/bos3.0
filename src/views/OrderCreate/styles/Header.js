import { css } from '@emotion/react'

export default {
  root: css({
    display: 'flex',
    padding: '12px 24px',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: 'none',
    border: '1px solid #f0f0f0',
    marginBottom: '12px',
  }),
  titleGroup: css({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }),
  actionGroup: css({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }),
  btnDiv: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  searchBtn: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: '#f5f5f5 !important',
    color: '#666 !important',
    '&:hover': {
      backgroundColor: '#eeeeee !important',
    }
  }),
  actionBtn: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: '#f5f5f5 !important',
    color: '#666 !important',
    '&:hover': {
      backgroundColor: '#eeeeee !important',
    }
  }),
  checkoutBtn: css({
    borderRadius: '20px !important',
    padding: '6px 24px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: '#007AFF !important',
    color: '#FFFFFF !important',
    '&:hover': {
      backgroundColor: '#005AC1 !important',
    }
  }),
  checkboxLabel: css({
    margin: 0,
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#333',
    }
  }),
  input: css({
    '& input': {
      padding: '8px 12px !important',
      fontSize: '14px',
    }
  })
}
