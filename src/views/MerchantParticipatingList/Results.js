/** @jsxImportSource @emotion/react */
import {
    Button, Card, Table, TableBody, TableCell, TableHead,
    TableRow, Box, TableContainer, Chip, Collapse,
    Typography, Tooltip, CardHeader, CardContent, IconButton
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
        border: '1px solid #f0f0f0',
        backgroundColor: '#fff',
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
        backgroundColor: '#FFFFFF',
        '& .MuiTableCell-head': {
            color: '#212121',
            fontWeight: 'bold',
            borderBottom: '1px solid #f0f0f0',
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
            borderBottom: '1px solid #f0f0f0',
            fontSize: '14px !important',
            color: '#333',
        },
        '&:hover': {
            backgroundColor: 'transparent !important',
        },
        '&.Mui-selected': {
            backgroundColor: '#f9f9f9 !important',
        },
        '&.Mui-selected:hover': {
            backgroundColor: '#f9f9f9 !important',
        },
    }),
    expandedRow: css({
        backgroundColor: '#fafafa',
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#1A73E8',
        }
    }),
    actionButton: css({
        padding: '4px !important',
        '& .MuiSvgIcon-root': {
            color: '#9e9e9e !important',
        },
        '&:hover .MuiSvgIcon-root': {
            color: '#1A73E8 !important',
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
        backgroundColor: '#f5f5f5 !important',
        color: '#666 !important',
        '&:hover': {
            backgroundColor: '#eeeeee !important',
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
        backgroundColor: '#3865ac !important',
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
                            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#202124' }}>
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
