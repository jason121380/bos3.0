export default {
    styleOverrides: {
        root: {
            boxShadow: 'none',
            border: 'none',
            borderRadius: '12px !important',
            marginBottom: '6px',
            '&:before': {
                display: 'none',
            },
            '&.Mui-expanded': {
                margin: '0 0 6px 0',
            },
        },
    }
}
