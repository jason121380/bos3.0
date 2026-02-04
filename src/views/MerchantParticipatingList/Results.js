/** @jsxImportSource @emotion/react */
import {
    Card, Table, TableBody, TableCell, TableHead,
    TableRow, Box, TableContainer, Chip, Collapse,
    Typography, Tooltip
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Fragment } from 'react'
import format from 'date-fns/format';
import { css } from '@emotion/react'

const arrowUp = <KeyboardArrowUpIcon style={{ cursor: 'pointer' }} />
const arrowDown = <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />

const styles = {
    root: css({
        marginTop: 24,
        '& .MuiChip-colorPrimary': {
            backgroundColor: '#3865ac !important'
        }
    }),
    setPadding: css({
        '& > .MuiTableCell-root': {
            padding: '12px 16px !important'
        }
    }),
    cursor: css({
        cursor: 'pointer',
    }),
    boxWrap: css({
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        '& span.MuiChip-label': {
            color: 'white'
        }
    })
}


function Results({ events, setCollapse, selectIds }) {
    return (
        <Fragment>
            {events.length ?
                <Card css={styles.root}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow css={styles.setPadding}>
                                    <TableCell></TableCell>
                                    <TableCell>名稱</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map(({ id, name, merchantList }) => {
                                    const isSelect = selectIds.includes(id)
                                    const Icon = () => isSelect ? arrowUp : arrowDown
                                    return (
                                        <Fragment key={id}>
                                            <TableRow css={css([styles.setPadding, merchantList.length ? styles.cursor : {}])} onClick={() => merchantList.length && setCollapse(id)} hover>
                                                <TableCell>
                                                    {merchantList.length ? <Icon /> : ''}
                                                </TableCell>
                                                <TableCell>{name}</TableCell>
                                            </TableRow>
                                            {merchantList.length ? (
                                                <TableRow>
                                                    <TableCell style={{ padding: 0 }} colSpan={12}>
                                                        <Collapse timeout="auto" unmountOnExit in={selectIds.indexOf(id) > -1}>
                                                            <Box padding={2} css={styles.boxWrap}>
                                                                {merchantList.map(({ id, name, joinTime }) => (
                                                                    <Tooltip key={id} arrow title={<p style={{ fontSize: 14 }}>{format(joinTime, 'yyyy/M/d')}</p>}>
                                                                        <Chip color='primary' label={name} />
                                                                    </Tooltip>
                                                                ))}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}
                                        </Fragment>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
                : <Typography variant="h3" style={{ textAlign: 'center', marginTop: 100 }}>無資料</Typography>
            }

        </Fragment>
    )
}
export default Results
