import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
    card: css({
        width: '100%',
        marginBottom: theme.spacing(1),
        boxShadow: 'none',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
    }),
    cardContent: css({
        padding: '16px 12px !important',
    }),
    box: css({
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    }),
    column: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    }),
    column1: css({
        flex: 1.2,
    }),
    column2: css({
        flex: 1.8,
    }),
    column3: css({
        flex: 2,
    }),
    row: css({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '42px', // Unify height for the first row of each column
    }),
    label: css({
        fontSize: '12px',
        color: '#999',
        marginBottom: '-4px',
    }),
    dateInput: css({
        width: '100%',
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#eee' },
            '& .MuiSvgIcon-root': {
                color: '#999',
                fontSize: '22px', // Unify size
            }
        }
    }),
    customerInput: css({
        width: '100%',
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#eee' },
        }
    }),
    employeeInput: css({
        width: '100%',
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#eee' },
        }
    }),
    addPersonIcon: css({
        cursor: 'pointer',
        color: '#999',
        fontSize: '22px',
        marginLeft: '14px',
    }),
    checkboxLabel: css({
        margin: 0,
        '& .MuiFormControlLabel-label': {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#333',
        },
        '& .MuiCheckbox-root': {
            padding: '4px',
        }
    }),
    toggleGroup: css({
        height: '42px',
        backgroundColor: '#f5f5f5',
        borderRadius: '21px !important',
        padding: '2px',
        border: '1px solid #eee',
        minWidth: '130px', // Ensure enough space for "不指定"
        '& .MuiToggleButton-root': {
            flex: 1,
            padding: '0 12px',
            fontSize: '14px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap', // Prevent text from wrapping
            border: 'none !important',
            borderRadius: '19px !important',
            transition: 'all 0.2s',
            '&.Mui-selected': {
                backgroundColor: '#fff',
                color: '#1976d2',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: '#fff' },
            },
            '&:not(.Mui-selected)': {
                color: '#666',
                '&:hover': { backgroundColor: 'transparent', color: '#333' },
            }
        }
    }),
}
