/** @jsxImportSource @emotion/react */
import {
  Button, Card, Table, TableBody, TableCell, TableHead,
  TableRow, Typography, TableContainer
} from '@mui/material'
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import format from 'date-fns/format'

function Results({ inventorys }) {
  return (
    <Fragment>
      {inventorys.length === 0 ? (
        <Typography variant="h3" gutterBottom component="div">
          無資料
        </Typography>
      ) : (
        <div>
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>操作</TableCell>
                    <TableCell>日期</TableCell>
                    <TableCell>狀態</TableCell>
                    <TableCell>建立者</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventorys.map(d => (
                    <TableRow key={d.id} hover>
                      <TableCell style={{ padding: 8 }}>
                        <Button
                          color="primary"
                          component={RouterLink}
                          to={d.isDraft ? `inventory-work/edit/${d.id}` : `inventory-work/review/${d.id}`}
                          size="small"
                          variant="outlined"
                        >
                          {d.isDraft ? '繼續盤點' : "查看"}
                        </Button>
                      </TableCell>
                      <TableCell>{format(d.date, 'yyyy/M/d  HH:mm')}</TableCell>
                      <TableCell>{d.isDraft ? '未完成' : '已完成'}</TableCell>
                      <TableCell>{d.creatorName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </div>
      )}
    </Fragment>
  )
}
export default Results
