import { colors } from 'ui/colors'

export default {
  styleOverrides: {
    root: {
      borderRadius: '20px !important',
      textTransform: 'none',
      fontWeight: 'bold !important',
      padding: '6px 20px',
      boxShadow: 'none !important',
      '&:hover': {
        boxShadow: 'none !important',
      }
    },
    contained: {
      backgroundColor: '#f5f5f5 !important',
      color: '#666 !important',
      boxShadow: 'none !important',
      '&:hover': {
        backgroundColor: '#eeeeee !important',
        boxShadow: 'none !important',
      },
      '&:disabled': {
        backgroundColor: '#F1F3F4 !important',
        color: '#999 !important',
        opacity: 0.38
      }
    },
    containedPrimary: {
      backgroundColor: '#007AFF !important',
      color: '#FFFFFF !important',
      '&:hover': {
        backgroundColor: '#005AC1 !important',
      }
    },
    outlined: {
      borderRadius: '20px !important',
      borderColor: '#eee',
      color: '#666',
      '&:hover': {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
      }
    }
  }
}
