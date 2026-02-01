import { css } from '@emotion/react'

export default {
  root: css({
    display: 'flex',
    padding: '12px 24px',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F0FE', // Light Blue background
    borderRadius: '12px',
    boxShadow: 'none',
    border: 'none !important',
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
    backgroundColor: '#FFFFFF !important',
    color: '#666 !important',
    '&:hover': {
      backgroundColor: '#f8f8f8 !important',
    }
  }),
  actionBtn: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: '#FFFFFF !important',
    color: '#666 !important',
    '&:hover': {
      backgroundColor: '#f8f8f8 !important',
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
