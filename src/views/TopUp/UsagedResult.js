/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Divider, Table,
  TableBody, TableCell, TableHead, TablePagination, TableRow, Typography,
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { css } from '@emotion/react'

import styles from './styles/UsagedResult'

function UsagedResult({ className, walletUseRecord, resultSetting, onChange, date, pagenationLabel, ...rest }) {
  const pageRef = useRef(null)
  const [excelData, setExcelData] = useState([])

  useEffect(() => {
    if(!walletUseRecord.loading) {
      const excelData = []
      const useRecords = idx(walletUseRecord.data, _ =>_.walletUseRecord.record)
      useRecords.forEach(data => {
        excelData.push({
          '帳單編號/時間': `#${data.orderNo}-` + format(data.date, 'yyyy/MM/dd'),
          客戶: `${data.Customer.name}/${data.Customer.cellphone}`,
          設計師: `${data.Designer.name}` + `${data.Designer.designerNo ? ' / ' + data.designerNo : ''}`,
          使用金額: data.money,
        })
      })
      excelData.push({
        '帳單編號/時間': '合計',
        客戶: '',
        設計師: '',
        使用金額: useRecords.reduce((prev, next) => prev + next.money, 0),
      })
      setExcelData(excelData)
      if (pageRef.current) {
        pagenationLabel(pageRef.current)
      }
    }
  }, [walletUseRecord.loading, pageRef.current])
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount)} 筆資料,{' '}
        {resultSetting.usaged.pageOffset + 1}/
        {Math.ceil(
          idx(walletUseRecord.data, _ => _.walletUseRecord.record.length) /
            resultSetting.usaged.pageLimit
        )}
      </Typography>
      <Card>
        <CardHeader
          action={
            <CSVLink data={excelData} filename="入金使用.csv" >
              <Button variant="contained" color="primary" size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title="入金使用"
        />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>操作</TableCell>
                    <TableCell>帳單編號/時間</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>使用金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {idx(walletUseRecord.data, _ =>
                    _.walletUseRecord.record.map(data => (
                      <TableRow hover key={`${data.id}-${data.index}`}>
                        <TableCell>
                          <Button
                            color="primary"
                            variant="outlined"
                            component={RouterLink}
                            to={`/order/${data.order.id}`}
                          >
                            訂單詳情
                          </Button>
                        </TableCell>
                        <TableCell>
                          {data.orderNo}
                          <Typography>{format(data.date, 'yyyy/MM/dd')}</Typography>
                        </TableCell>
                        <TableCell>
                          {idx(data.Customer, _ => _.name)}
                          <Typography>{idx(data.Customer, _ => _.cellphone)}</Typography>
                        </TableCell>
                        <TableCell>
                          {idx(
                            data.Designer,
                            _ => `${_.name}${_.designerNo ? ' / ' + _.designerNo : ''}`
                          )}
                        </TableCell>
                        <TableCell>{data.money}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell>
                      {idx(walletUseRecord, _ =>
                        _.data.walletUseRecord.record.reduce((prev, next) => prev + next.money, 0)
                      )}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount) || 0}
            onPageChange={(_event, page) =>
              onChange({ event: { target: { value: page } }, key: 'pageOffset' })
            }
            onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
            page={resultSetting.usaged.pageOffset}
            rowsPerPage={resultSetting.usaged.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar />
    </div>
  )
}

UsagedResult.propTypes = {
  className: PropTypes.object
}

export default UsagedResult
