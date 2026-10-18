import { css } from '@emotion/react'
import { theme } from '../../../theme'

export default {
    card: css({
        width: '100%',
        marginBottom: theme.spacing(1),
        boxShadow: 'none',
        border: '1px solid rgb(var(--border))',
        borderRadius: '8px',
    }),
    cardContent: css({
        padding: '16px 12px !important',
    }),
    box: css({
        display: 'flex',
        flexWrap: 'wrap', // 窄螢幕時三欄自動換行，不再把欄位擠成一條細縫
        gap: '16px 12px',
        alignItems: 'flex-start',
    }),
    column: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    }),
    column1: css({
        flex: '1.2 1 220px',
    }),
    column2: css({
        flex: '1.8 1 280px',
    }),
    column3: css({
        flex: '2 1 340px',
    }),
    row: css({
        display: 'flex',
        alignItems: 'flex-end', // 上方有標籤，控制項靠底部對齊
        gap: '12px',
        flexWrap: 'wrap',
    }),
    label: css({
        fontSize: '12px',
        color: 'rgb(var(--text-tertiary))',
        marginBottom: '-4px',
    }),
    dateInput: css({
        width: '100%',
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgb(var(--background))',
            '& fieldset': { borderColor: 'rgb(var(--border-strong))' }, // 與 ui/input 的框線同色
            '& .MuiSvgIcon-root': {
                color: 'rgb(var(--text-tertiary))',
                fontSize: '22px', // Unify size
            }
        }
    }),
    customerInput: css({
        width: '100%',
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgb(var(--background))',
            '& fieldset': { borderColor: 'rgb(var(--border-strong))' }, // 與 ui/input 的框線同色
        }
    }),
    employeeInput: css({
        width: '100%',
        flex: 1,
        minWidth: 180,
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgb(var(--background))',
            '& fieldset': { borderColor: 'rgb(var(--border-strong))' }, // 與 ui/input 的框線同色
        }
    }),
    addPersonIcon: css({
        cursor: 'pointer',
        color: 'rgb(var(--text-tertiary))',
        fontSize: '22px',
        marginLeft: '14px',
    }),
    checkboxLabel: css({
        margin: 0,
        whiteSpace: 'nowrap', // 「鎖定日期」「不留客資」不可被擠成兩行
        '& .MuiFormControlLabel-label': {
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'rgb(var(--text))',
        },
        '& .MuiCheckbox-root': {
            padding: '4px',
        }
    }),
    toggleGroup: css({
        height: '42px',
        backgroundColor: 'rgb(var(--surface))',
        borderRadius: '21px !important',
        padding: '2px',
        border: '1px solid rgb(var(--border))',
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
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--text))',
                boxShadow: '0 0 0 1px rgb(var(--border))',
                '&:hover': { backgroundColor: 'rgb(var(--background))' },
            },
            '&:not(.Mui-selected)': {
                color: 'rgb(var(--text-secondary))',
                '&:hover': { backgroundColor: 'transparent', color: 'rgb(var(--text))' },
            }
        }
    }),
}
