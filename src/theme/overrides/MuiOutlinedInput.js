export default {
  styleOverrides: {
    root: {
      backgroundColor: 'transparent',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      '&.MuiInputBase-multiline': {
        height: 'auto',
        minHeight: '42px',
      },
      '&.MuiInputBase-sizeSmall': {
        height: '42px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#007AFF',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#007AFF',
        borderWidth: '2px',
      },
      '&.Mui-focused': {
        backgroundColor: 'transparent',
      }
    },
    input: {
      textAlign: 'left',
      padding: '9px 14px 13px 14px !important', // Asymmetric padding for visual centering (compensate for font baseline)
      height: '42px !important',
      lineHeight: '20px !important',
      boxSizing: 'border-box !important',
      '&.MuiInputBase-inputMultiline': {
        textAlign: 'left',
        padding: '10px 14px !important',
        height: 'auto !important',
        lineHeight: '1.5 !important',
      }
    },
    inputSizeSmall: {
      padding: '9px 14px 13px 14px !important',
      height: '42px !important',
      lineHeight: '20px !important',
    },
    notchedOutline: {
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: '1px',
      borderRadius: 8, // Unified to 8px
    },
  }
}
