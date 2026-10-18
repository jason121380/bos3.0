/** @jsxImportSource @emotion/react */
import {
    Button, Card, Table, TableBody, TableCell, TableHead,
    TableRow, Box, TableContainer, Chip, Collapse,
    Typography, Tooltip, CardHeader, CardContent, IconButton
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from 'ui/icons'
import { Fragment } from 'react'
import format from 'date-fns/format';
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const arrowUp = <KeyboardArrowUpIcon style={{ cursor: 'pointer' }} />
const arrowDown = <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />

const styles = {
    root: css({
        marginTop: theme.spacing(1),
    }),
    card: css({
        borderRadius: '16px',
        boxShadow: 'none',
        border: '1px solid rgb(var(--border))',
        backgroundColor: 'rgb(var(--background))',
        overflow: 'hidden',
    }),
    content: css({
        padding: 0,
    }),
    inner: css({
        minWidth: 700,
        '& td': {
            whiteSpace: 'nowrap !important'
        },
    }),
    tableHead: css({
        backgroundColor: 'rgb(var(--background))',
        '& .MuiTableCell-head': {
            color: 'rgb(var(--text))',
            fontWeight: 'bold',
            borderBottom: '1px solid rgb(var(--border))',
            height: '40px !important',
            padding: '2px 16px !important',
            fontSize: '14px',
        }
    }),
    tableRow: css({
        height: '40px !important',
        minHeight: '40px !important',
        '& .MuiTableCell-body': {
            padding: '2px 16px !important',
            borderBottom: '1px solid rgb(var(--border))',
            fontSize: '14px !important',
            color: 'rgb(var(--text))',
        },
        '&:hover': {
            backgroundColor: 'transparent !important',
        },
        '&.Mui-selected': {
            backgroundColor: 'rgb(var(--surface)) !important',
        },
        '&.Mui-selected:hover': {
            backgroundColor: 'rgb(var(--surface)) !important',
        },
    }),
    expandedRow: css({
        backgroundColor: 'rgb(var(--surface))',
        position: 'relative',
    }),
    actionButton: css({
        padding: '4px !important',
        '& .MuiSvgIcon-root': {
            color: 'rgb(var(--text-tertiary)) !important',
        },
        '&:hover .MuiSvgIcon-root': {
            color: 'rgb(var(--accent)) !important',
        },
        '&:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
        }
    }),
    pillButton: css({
        borderRadius: '20px !important',
        padding: '4px 16px !important',
        fontSize: '13px !important',
        boxShadow: 'none !important',
        fontWeight: 'bold !important',
    }),
    secondaryPill: css({
        backgroundColor: 'rgb(var(--surface)) !important',
        color: 'rgb(var(--text-secondary)) !important',
        '&:hover': {
            backgroundColor: 'rgb(var(--surface)) !important',
        }
    }),
    boxWrap: css({
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        '& span.MuiChip-label': {
            color: 'white'
        }
    }),
    chip: css({
        backgroundColor: 'rgb(var(--accent)) !important',
        '&:hover': {
            backgroundColor: '#2d528b !important',
        }
    })
}


function Results({ events, setCollapse, selectIds, onToggleAll, isAllExpanded }) {
    return (
        <div css={styles.root}>
            <Card css={styles.card}>
                <CardHeader
                    title={
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                                店家參與清單
                            </Typography>
                            <Typography color="textSecondary" variant="body2">
                                共 {events.length} 個活動
                            </Typography>
                        </div>
                    }
                    action={
                        events.length > 0 && (
                            <Button
                                css={css([styles.pillButton, styles.secondaryPill])}
                                onClick={onToggleAll}
                            >
                                {isAllExpanded ? '全部收合' : '全部展開'}
                            </Button>
                        )
                    }
                />
                <CardContent css={styles.content}>
                    <PerfectScrollbar>
                        <div css={styles.inner}>
                            <Table size="small">
                                <TableHead css={styles.tableHead}>
                                    <TableRow>
                                        <TableCell style={{ width: 48 }}></TableCell>
                                        <TableCell>活動名稱</TableCell>
                                        <TableCell>參與店家數量</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.length > 0 ? (
                                        events.map(({ id, name, merchantList }) => {
                                            const isSelect = selectIds.includes(id)
                                            const Icon = isSelect ? KeyboardArrowUpIcon : KeyboardArrowDownIcon
                                            return (
                                                <Fragment key={id}>
                                                    <TableRow
                                                        css={styles.tableRow}
                                                        selected={isSelect}
                                                    >
                                                        <TableCell>
                                                            {merchantList.length > 0 && (
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setCollapse(id)}
                                                                    css={styles.actionButton}
                                                                >
                                                                    <Icon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                        </TableCell>
                                                        <TableCell style={{ fontWeight: 'bold' }}>{name}</TableCell>
                                                        <TableCell>{merchantList.length} 家</TableCell>
                                                    </TableRow>
                                                    {merchantList.length > 0 && (
                                                        <TableRow>
                                                            <TableCell style={{ padding: 0 }} colSpan={3}>
                                                                <Collapse in={isSelect} timeout="auto" unmountOnExit>
                                                                    <div css={styles.expandedRow} style={{ padding: '12px 24px 16px 48px' }}>
                                                                        <Box css={styles.boxWrap}>
                                                                            {merchantList.map(({ id: mId, name: mName, joinTime }) => (
                                                                                <Tooltip key={mId} arrow title={<p style={{ fontSize: 13 }}>參與日期: {format(joinTime, 'yyyy/MM/dd')}</p>}>
                                                                                    <Chip css={styles.chip} color='primary' label={mName} size="small" />
                                                                                </Tooltip>
                                                                            ))}
                                                                        </Box>
                                                                    </div>
                                                                </Collapse>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </Fragment>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" style={{ padding: '40px 0' }}>
                                                <Typography color="textSecondary">目前無活動參與資料</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </PerfectScrollbar>
                </CardContent>
            </Card>
        </div>
    )
}
export default Results
