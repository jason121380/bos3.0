export default {
  styleOverrides: {
    root: {
      textOverflow: 'unset',
      whiteSpace: 'unset',
      fontSize: '14px',
      // Ensure the label is centered in the 42px height input when not shrunk
      '&.MuiInputLabel-outlined': {
        transform: 'translate(14px, 9px) scale(1)', // 9px top to match asymmetric input padding for visual centering
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -6px) scale(0.75)', // Standard shrink position
        }
      }
    },
  }
}
