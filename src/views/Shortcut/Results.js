/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Paper, Collapse, Box, IconButton, Button, Typography
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Link } from 'react-router-dom'
import format from 'date-fns/format';
import getLabel from 'utils/getTransferListLabel'
import { Fragment } from 'react'

export default function Results({ reportData, open, openCollapse }) {
  return reportData.length ? (
    <TableContainer style={{ margin: '12px 0' }} className='multiMerchantsLeaderBoardTable' component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell className='noprint'>展開</TableCell>
            <TableCell>編輯</TableCell>
            <TableCell>代號</TableCell>
            <TableCell>名稱</TableCell>
            <TableCell>建立者</TableCell>
            <TableCell>建立時間</TableCell>
            <TableCell>編輯者</TableCell>
            <TableCell>編輯時間</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map(d => (
            <Fragment key={d.id}>
              <TableRow >
                <TableCell className='noprint'>
                  <IconButton
                    onClick={() => openCollapse(d.id)}
                  >
                    {open.indexOf(d.id) > -1 ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/shortcut/edit/${d.id}`}>
                    <Button
                      variant='outlined'
                      color='primary'
                    >編輯</Button>
                  </Link>
                </TableCell>
                <TableCell>{d.no}</TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.creator.name}</TableCell>
                <TableCell>{format(d.createdAt, 'yyyy/MM/dd HH:mm')}</TableCell>
                <TableCell>{d.editor && d.editor.name}</TableCell>
                <TableCell>{format(d.updatedAt, 'yyyy/MM/dd HH:mm')}</TableCell>
              </TableRow>
              <TableRow className='noprint'>
                  <TableCell style={{ padding: 0 }} colSpan={8}>
                    <Collapse timeout="auto" unmountOnExit in={open.indexOf(d.id) > -1}>
                      <Box margin={2}>
                        {d.collapesData.length ? (
                          <TableContainer component={Paper}>
                            <Table className='multiMerchantsLeaderBoardCollapse'>
                              <TableHead>
                                <TableRow>
                                  <TableCell>服務項目</TableCell>
                                  <TableCell>店販銷售</TableCell>
                                  <TableCell>預收卡</TableCell>
                                  <TableCell>會員卡</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {d.collapesData.map(({
                                  service, product, ticket, membership
                                }, i) => (
                                  <TableRow key={`${d.id}-${i}-collapesData`} >
                                    <TableCell>{service && getLabel(service)}</TableCell>
                                    <TableCell>{product && getLabel(product)}</TableCell>
                                    <TableCell>{ticket && getLabel(ticket)}</TableCell>
                                    <TableCell>{membership && getLabel(membership)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography sx={{ m: '14px auto 0' }} variant="h4" component="div">無資料</Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Typography variant="h3" component="div">無資料</Typography>
  )
}
