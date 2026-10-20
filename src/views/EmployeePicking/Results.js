/** @jsxImportSource @emotion/react */
// 勾選後出現的底部操作列：比照 components/TableEditBar 的浮動批次操作列（原 persistent Drawer：未勾選時仍在 DOM、隱藏）
import { Download, Pencil, Trash2 } from 'lucide-react'
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { CSVLink } from "react-csv";
import useFetchDeletePicking from 'hooks/useFetchDeletePicking'
import { openSnackbar } from 'elements/snackbars'
import pagenationLabel from './../../helper/pagenationLabel'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 左側三欄固定（勾選 / 操作 / 日期），與舊版 sticky1~3 相同位置
const sticky1 = 'sticky left-0 z-[1] w-[52px] bg-background'
const sticky2 = 'sticky left-[52px] z-[1] w-[52px] bg-background'
const sticky3 = 'sticky left-[104px] z-[1] w-[120px] bg-background'

function Results({
  pageSetting,
  className,
  pickingRecords,
  onPageChange,
  onRowsPerPageChange,
  actionsBanned,
  ...rest
}) {
  const pageRef = useRef(null)
  const blockPicking = actionsBanned.includes('PICKING')
  const [excelData, setExcelData] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const open = selectedOrders.length > 0
  const recordArr = []
  const { deletePicking } = useFetchDeletePicking()

  pickingRecords.PickingRecord.map(record => {
    recordArr.push(record.id)
  })

  useEffect(() => {
    const excelData = []
    pickingRecords.PickingRecord.forEach(record => {
      excelData.push({
        日期: format(new Date(record.date), 'MM/dd/yyyy'),
        '商品代號/名稱':
          record.productNo === null || record.productNo === ''
            ? record.productName
            : record.productNo + ' / ' + record.productName,
        單價: record.price,
        數量: record.count,
        小計: record.total,
        領料人: `${record.Picker.name}${record.Picker.designerNo ? `/${record.Picker.designerNo}` : ''
          }`,
        用途: record.purpose,
        備註: record.remark,
      })
    })
    excelData.push({
      日期: '合計',
      數量: total('count'),
      小計: total('total'),
    })
    setExcelData(excelData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pickingRecords, pageRef.current])

  const total = key => {
    return pickingRecords.PickingRecord.reduce((accu, curVal) => accu + curVal[key], 0)
  }

  const handleSelectAll = event => {
    let newSelectedPayment = []
    if (blockPicking) {
      if (event.target.checked) {
        pickingRecords.PickingRecord.forEach(({ id, isClosed }) => {
          if (!isClosed) newSelectedPayment.push(id)
        })
      }
    } else {
      newSelectedPayment = event.target.checked ? recordArr : []
    }
    setSelectedOrders(newSelectedPayment)
  }

  const handleCheckedAll = () => {
    const selectableLength = (
      blockPicking ? pickingRecords.PickingRecord.filter(({ isClosed }) => !isClosed).length : recordArr.length
    )
    return selectedOrders.length === selectableLength && selectableLength > 0
  }

  const handlecheckIndeterminate = () => {
    const selectableLength = (
      blockPicking ? pickingRecords.PickingRecord.filter(({ isClosed }) => !isClosed).length : recordArr.length
    )
    return selectedOrders.length > 0 && selectedOrders.length < selectableLength
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedOrders], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }

  const handleDelete = () => {
    deletePicking(selectedOrders).then(() => {
      openSnackbar({
        message: '刪除 員工領料/自購 成功',
        variant: 'success',
      })
      window.location.reload()
    })
  }
  return (
    <Fragment>
      <div {...rest} css={className}>
        <Card>
          <CardHeader
            className="items-center pb-4"
            action={
              <Button asChild size="sm" variant="secondary">
                <CSVLink
                  data={excelData}
                  filename="材料自購登錄.csv"
                >
                  <Download strokeWidth={1.75} />
                  報表匯出
                </CSVLink>
              </Button>
            }
          >
            <div className="flex items-baseline gap-3">
              <CardTitle>材料自購登錄列表</CardTitle>
              <span className="text-label text-text-secondary tabular-nums">
                共 {pickingRecords.totalCount} 筆
              </span>
            </div>
          </CardHeader>
          <div className="px-5 pb-5">
            <Table className="min-w-[1300px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={`${sticky1} bg-surface px-4`}>
                    <Checkbox
                      aria-label="全選"
                      checked={handleCheckedAll()}
                      indeterminate={handlecheckIndeterminate()}
                      onChange={handleSelectAll}
                      disabled={recordArr.length === 0}
                    />
                  </TableHead>
                  <TableHead className={`${sticky2} bg-surface`}>操作</TableHead>
                  <TableHead className={`${sticky3} bg-surface`}>日期</TableHead>
                  <TableHead>商品代號/名稱</TableHead>
                  <TableHead numeric>單價</TableHead>
                  <TableHead numeric>數量</TableHead>
                  <TableHead numeric>小計</TableHead>
                  <TableHead>領料人</TableHead>
                  <TableHead>用途</TableHead>
                  <TableHead>備註</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {pickingRecords.PickingRecord.map((record, index) => {
                  return (
                    <TableRow key={record.id} data-state={selectedOrders.indexOf(record.id) > -1 ? 'selected' : undefined}>
                      <TableCell className={sticky1}>
                        <Checkbox
                          aria-label="選取此筆"
                          disabled={blockPicking ? record.isClosed : false}
                          checked={selectedOrders.indexOf(record.id) > -1}
                          onChange={() => handleSelectOne(record.id)}
                          data-testid={`order-checkbox-${index}`}
                        />
                      </TableCell>
                      <TableCell className={`${sticky2} px-2`}>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-accent">
                          <RouterLink
                            aria-label="編輯"
                            to={`/employee/picking/edit/${record.id}`}
                          >
                            <Pencil strokeWidth={1.75} />
                          </RouterLink>
                        </Button>
                      </TableCell>
                      <TableCell className={`${sticky3} tabular-nums`}>{format(new Date(record.date), 'MM/dd/yyyy')}</TableCell>
                      <TableCell>
                        {record.productNo === null || record.productNo === ''
                          ? record.productName
                          : record.productNo + ' / ' + record.productName}
                      </TableCell>
                      <TableCell numeric>{formatNumber(record.price)}</TableCell>
                      <TableCell numeric>{formatNumber(record.count)}</TableCell>
                      <TableCell numeric>{formatNumber(record.total)}</TableCell>
                      <TableCell>
                        {record.Picker.name}
                        {record.Picker.designerNo ? `/${record.Picker.designerNo}` : ''}
                      </TableCell>
                      <TableCell className="text-text-secondary">{record.purpose}</TableCell>
                      <TableCell className="text-text-secondary">{record.remark}</TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="bg-surface hover:bg-surface">
                  <TableCell className={`${sticky1} bg-surface`} />
                  <TableCell className={`${sticky2} bg-surface font-medium`}>合計</TableCell>
                  <TableCell className={`${sticky3} bg-surface`} />
                  <TableCell />
                  <TableCell />
                  <TableCell numeric className="font-medium">{formatNumber(total('count'))}</TableCell>
                  <TableCell numeric className="font-medium">{formatNumber(total('total'))}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      <div
        hidden={!open}
        className={`ui-root noprint pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-[1200] justify-center px-4 lg:bottom-6 ${open ? 'flex' : 'hidden'}`}
      >
        <div
          {...rest}
          css={className}
          role="toolbar"
          aria-label="批次操作"
          className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-solid border-border bg-background py-1.5 pl-4 pr-1.5 shadow-float"
        >
          <span className="mr-2 text-label tabular-nums text-text">
            {selectedOrders.length} selected
          </span>
          <span aria-hidden="true" className="mr-1 h-5 w-px bg-border" />
          <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/8" onClick={() => handleDelete()}>
            <Trash2 strokeWidth={1.75} />
            刪除
          </Button>
        </div>
      </div>
    </Fragment>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
