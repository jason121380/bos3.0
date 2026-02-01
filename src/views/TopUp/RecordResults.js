/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Divider,
  Table, TableBody, TableCell, TableHead, TablePagination,
  TableRow, Typography
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import { useEffect, useState, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useHistory } from 'react-router'
import { CSVLink } from "react-csv";
import { css } from '@emotion/react'

import styles from './styles/RecordResults'

function Results({ className, date, walletDepositRecord, onChange, resultSetting, pagenationLabel, ...rest }) {
  const history = useHistory()
  const pageRef = useRef(null)
  const [excelData, setExcelData] = useState([])

  const handleEdit = id => {
    history.push(`/topup/edit/${id}`)
  }
  useEffect(() => {
    history.listen((newLocation, action) => {
      if (action === 'POP' && newLocation.pathname.match('/topup/edit')) {
        history.go(1)
      }
    })
  }, [])

  useEffect(() => {
    if(!walletDepositRecord.loading) {
      const excelData = []
      const recordData =  idx(walletDepositRecord.data, _ => _.walletDepositRecord.record)
        recordData.forEach(record => {
          excelData.push({
            日期: format(record.date, 'yyyy/MM/dd'),
            '客戶(編號)': `${record.Customer.name}${
              record.Customer.no ? `(${record.Customer.no})` : ''
            }/${record.Customer.cellphone}`,
            實際付款金額: record.handlingFeeDecountWay === 'BYCUSTOMER'
              ? record.money + Math.abs(record.handlingFeeDecountPrice)
                : record.money,
            入金金額: record.money,
            設計師: `${record.Maker.name}/${record.Maker.designerNo ? record.Maker.designerNo : ''}`,
            付款方式: record.payType,
            入金儲值手續費負擔方: record.handlingFeeDecountWay === 'BYDESIGNER' ? '由設計師負擔'
              : record.handlingFeeDecountWay === 'BYCUSTOMER' ? '由客人負擔' : '不扣項',
            入金儲值手續費: record.handlingFeeDecountPrice,
            備註: record.remark,
          })
        })

      let total = 0
      recordData.map(record => {
        if (record.handlingFeeDecountWay === 'BYCUSTOMER') {
          total += record.money + Math.abs(record.handlingFeeDecountPrice)
        } else {
          total += record.money
        }
      })

      excelData.push({
        日期: '合計',
        '客戶(編號)': '',
        實際付款金額: total,
        入金金額: recordData.reduce((prev, next) => prev + next.money,0),
        設計師: '',
        付款方式: '',
        入金儲值手續費負擔方: '',
        入金儲值手續費: recordData.reduce((prev, next) => prev + next.handlingFeeDecountPrice,0),
        備註: '',
      })
      
      setExcelData(excelData)
    }
  }, [walletDepositRecord.loading])
  let total = 0
  if (walletDepositRecord != undefined) {
    idx(walletDepositRecord.data, _ =>
      _.walletDepositRecord.record.map(record => {
        if (record.handlingFeeDecountWay === 'BYCUSTOMER') {
          total += record.money + Math.abs(record.handlingFeeDecountPrice)
        } else {
          total += record.money
        }
      })
    )
  }

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [walletDepositRecord, pageRef.current])
  
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount)} 筆資料,
        {resultSetting.record.pageOffset + 1}/
        {Math.ceil(
          idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount) /
            resultSetting.record.pageLimit
        )}
      </Typography>
      <Card>
        <CardHeader
          action={
            <CSVLink data={excelData} filename="入金紀錄.csv">
              <Button variant="contained" color="primary" size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title="入金紀錄"
        />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                {/* head */}
                <TableHead>
                  <TableRow>
                    <TableCell>操作</TableCell>
                    <TableCell>日期</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>實際付款金額</TableCell>
                    <TableCell>入金金額</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>付款方式</TableCell>
                    <TableCell>入金儲值手續費負擔方</TableCell>
                    <TableCell>入金儲值手續費</TableCell>
                    <TableCell>備註</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {idx(walletDepositRecord.data, _ =>
                    _.walletDepositRecord.record.map(record => (
                      <TableRow hover key={record.id}>
                        <TableCell>
                          <Button
                            color="primary"
                            size="small"
                            onClick={() => handleEdit(record.id)}
                            variant="outlined"
                          >
                            編輯
                          </Button>
                        </TableCell>
                        <TableCell>{format(record.date, 'yyyy/MM/dd')}</TableCell>
                        <TableCell>
                          {record.Customer.name}
                          <Typography variant="body2" display="inline">
                            {record.Customer.no ? `(${record.Customer.no})` : ''}
                          </Typography>
                          <Typography>{record.Customer.cellphone}</Typography>
                        </TableCell>
                        <TableCell>
                          {record.handlingFeeDecountWay === 'BYCUSTOMER'
                            ? record.money + Math.abs(record.handlingFeeDecountPrice)
                            : record.money}
                        </TableCell>
                        <TableCell>{record.money}</TableCell>
                        <TableCell>
                          {record.Maker.name}
                          {record.Maker.designerNo ? ' / ' + record.Maker.designerNo : ''}
                        </TableCell>
                        <TableCell>{record.payType}</TableCell>
                        <TableCell>
                          {record.handlingFeeDecountWay === 'BYDESIGNER'
                            ? '由設計師負擔'
                            : record.handlingFeeDecountWay === 'BYCUSTOMER'
                            ? '由客人負擔'
                            : '不扣項'}
                        </TableCell>
                        <TableCell>{record.handlingFeeDecountPrice}</TableCell>
                        <TableCell>{record.remark}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {/* list footer */}
                  <TableRow hover>
                    <TableCell colSpan={2} style={{ fontWeight: 'bold' }}>
                      合計
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>{total}</TableCell>

                    <TableCell>
                      {idx(walletDepositRecord, _ =>
                        _.data.walletDepositRecord.record.reduce(
                          (prev, next) => prev + next.money,
                          0
                        )
                      )}
                    </TableCell>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell>
                      {idx(walletDepositRecord, _ =>
                        _.data.walletDepositRecord.record.reduce(
                          (prev, next) => prev + next.handlingFeeDecountPrice,
                          0
                        )
                      )}
                    </TableCell>
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
            count={idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount) || 0}
            onPageChange={(_event, page) =>
              onChange({ event: { target: { value: page } }, key: 'pageOffset' })
            }
            onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
            page={resultSetting.record.pageOffset}
            rowsPerPage={resultSetting.record.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar />
    </div>
  )
}

export default Results
