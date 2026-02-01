/** @jsxImportSource @emotion/react */
import {
  Card, Table, TableBody, TableCell, TableHead,
  TableRow, Box, TableContainer, Collapse, Typography
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Fragment, useState } from 'react'
import clsx from 'clsx';
import { cloneDeep } from 'lodash';
import { format } from 'date-fns';
import { css } from '@emotion/react'

const arrowUp = <KeyboardArrowUpIcon style={{ cursor: 'pointer' }} />
const arrowDown = <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />

const styles = {
  root: css({
    marginTop: 24,
    '& th.MuiTableCell-root.MuiTableCell-head': {
      padding: '2px 5px',
      whiteSpace: 'pre',
      fontWeight: 600,
      backgroundColor: '#08424c',
      color: '#ffffff',
    },
    '& td.MuiTableCell-root.MuiTableCell-body': {
      padding: '2px 5px',
      whiteSpace: 'pre'
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
  box: css({
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0px 1px 3px 0px rgb(0 0 0 / 12%)',
    padding: 0,
    margin: 16,
    '& th': {
      backgroundColor: '#b94831 !important'
    },
  }),
}

function EventTicketsRecord({ data }) {
  const { message, customerEventTickets } = data
  const [selectIds, setSelectIds] = useState([])

  const handleSetCollapse = id => {
    const cloneIds = cloneDeep(selectIds)
    const idx = cloneIds.indexOf(id)
    if (idx > -1) {
      cloneIds.splice(idx, 1)
    } else {
      cloneIds.push(id)
    }
    setSelectIds(cloneIds)
  }

  return (
    <Fragment>
      {customerEventTickets.length > 0 ? (
        <Card css={styles.root}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>名稱</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerEventTickets.map(({ eventName, tickets }, i) => {
                  const isSelect = selectIds.includes(`${eventName}-${i}`)
                  const Icon = () => isSelect ? arrowUp : arrowDown
                  return (
                    <Fragment key={`${eventName}-${i}`}>
                      <TableRow css={clsx(tickets.length ? styles.cursor : '')} onClick={() => tickets.length && handleSetCollapse(`${eventName}-${i}`)}>
                        <TableCell>
                          {tickets.length ? <Icon /> : ''}
                        </TableCell>
                        <TableCell>{eventName}</TableCell>
                      </TableRow>
                      {tickets.length ? (
                        <TableRow>
                          <TableCell style={{ padding: 0 }} colSpan={10}>
                            <Collapse timeout="auto" unmountOnExit in={selectIds.indexOf(`${eventName}-${i}`) > -1}>
                              <Box padding={2} css={styles.box}>
                                <TableContainer >
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>流水號</TableCell>
                                        <TableCell>發券日期</TableCell>
                                        <TableCell>發券店家</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {tickets.map(({ serialNumber, consumptionDate, consumptionStoreName }) => (
                                        <TableRow key={serialNumber}>
                                          <TableCell>{serialNumber}</TableCell>
                                          <TableCell>{format(consumptionDate, 'yyyy/M/d')}</TableCell>
                                          <TableCell>{consumptionStoreName}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
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
      ) : <Typography variant="h3" style={{ textAlign: 'center', marginTop: 50 }}>
        {message}
      </Typography>}
    </Fragment>
  )
}
export default EventTicketsRecord
