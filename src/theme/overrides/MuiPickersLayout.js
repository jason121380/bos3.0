export default {
    styleOverrides: {
        root: {
            padding: 0,
            border: 'none !important',
            overflow: 'hidden',
            '& .MuiPickersLayout-header': {
                width: '100%',
            },
            '& .MuiDialogActions-root': {
                '& button': {
                    color: '#8E8E93 !important',
                    fontWeight: 'bold',
                }
            }
        }
    }
}
