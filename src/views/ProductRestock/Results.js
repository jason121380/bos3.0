import { Eye, Pencil, Trash2 } from 'lucide-react'
import PropTypes from 'prop-types'
import { useState, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import cloneDeep from 'lodash/cloneDeep'
import useFetchDeletePurchase from 'hooks/useFetchDeletePurchase'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({
  purchaseRecordsData,
  purchaseRecords,
  setPurchaseRecords,
  pickingRecords,
  onPageChange,
  onRowsPerPageChange,
  handleSearch,
  handleCheck,
  selectAllRecords,
  ...rest
}) {
  const { deletePurchase } = useFetchDeletePurchase()
  const [selectId, setSelectId] = useState([])

  const selectAllData = event => {
    const newSelectedId = event.target.checked ? selectAllRecords : []
    setSelectId(newSelectedId)
  }

  const selectOne = id => {
    const selectedIndex = selectId.indexOf(id)
    const newSelected = cloneDeep(selectId)
    if (selectedIndex === -1) {
      newSelected.push(id)
    } else {
      newSelected.splice(selectedIndex, 1)
    }
    setSelectId(newSelected)
  }

  const open = selectId.length > 0
  const recordArr = []
  purchaseRecords.map(record => {
    recordArr.push(record.id)
  })

  const handleDelete = () => {
    deletePurchase({
      purchaseUUIds: selectId,
    })
      .then(res => {
        if (res.data.deletePurchase) {
          openSnackbar({ message: '刪除成功', variant: 'success' })
          handleSearch()
        }
      })
      .catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
      })
  }

  return (
    <Fragment>
      <div {...rest}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-baseline gap-3">
              <CardTitle>所有進貨單</CardTitle>
              <span className="text-label tabular-nums text-text-secondary">
                共 {purchaseRecords.length} 筆資料
              </span>
            </div>
          </CardHeader>
          <div className="px-5 pb-5">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      aria-label="全選"
                      checked={selectId.length === selectAllRecords.length && selectAllRecords.length > 0}
                      onChange={event => selectAllData(event)}
                      disabled={selectAllRecords.length === 0}
                      indeterminate={
                        selectId.length > 0 && selectId.length < selectAllRecords.length
                      }
                    />
                  </TableHead>
                  <TableHead className="w-[140px]">單號</TableHead>
                  <TableHead className="w-[110px]">日期</TableHead>
                  <TableHead className="w-[180px]">廠商</TableHead>
                  <TableHead className="w-[100px]">進貨人</TableHead>
                  <TableHead numeric className="w-[100px]">金額</TableHead>
                  <TableHead className="w-[150px]">異動時間</TableHead>
                  <TableHead>備註</TableHead>
                  <TableHead className="w-[150px]">入庫時間</TableHead>
                  <TableHead className="w-[110px] text-center">狀態處理</TableHead>
                  <TableHead className="w-[60px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseRecords.map((data, index) => {
                  const isSelected = selectId.indexOf(data.uuid) > -1
                  return (
                    <TableRow
                      key={`${data.no}-${index}`}
                      data-state={isSelected ? 'selected' : undefined}
                    >
                      <TableCell className="w-[50px]">
                        <Checkbox
                          aria-label={`選取 ${data.no}`}
                          disabled={!!data.stockInDate}
                          checked={isSelected}
                          onChange={() => selectOne(data.uuid)}
                        />
                      </TableCell>
                      <TableCell className="w-[140px] font-medium tabular-nums">{data.no}</TableCell>
                      <TableCell className="w-[110px] tabular-nums">{format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                      <TableCell className="w-[180px]">{data.vendorName}</TableCell>
                      <TableCell className="w-[100px]">{data.operatorName}</TableCell>
                      <TableCell numeric className="w-[100px]">{formatNumber(data.summary)}</TableCell>
                      <TableCell className="w-[150px] tabular-nums">
                        {format(new Date(data.updatedAt), 'yyyy/MM/dd HH:mm')}
                      </TableCell>
                      <TableCell>{data.remark}</TableCell>
                      <TableCell className="w-[150px] tabular-nums">{data.stockInDate && format(new Date(data.stockInDate), 'yyyy/MM/dd HH:mm')}</TableCell>
                      <TableCell className="w-[110px] text-center">
                        <Button
                          size="sm"
                          onClick={() => handleCheck(data)}
                          variant={data.stockInDate ? 'ghost' : 'secondary'}
                          className={data.stockInDate ? 'text-danger hover:bg-danger/8' : undefined}
                        >{data.stockInDate ? '取消入庫' : '確認入庫'}</Button>
                      </TableCell>
                      <TableCell className="w-[60px] text-right">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                          <RouterLink
                            aria-label={data.stockInDate ? '查看進貨單' : '編輯進貨單'}
                            to={`/product/restock/edit/${data.uuid}`}
                          >
                            {data.stockInDate ? <Eye strokeWidth={1.75} /> : <Pencil strokeWidth={1.75} />}
                          </RouterLink>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      {/* 批次操作列：外觀比照 components/TableEditBar；與舊版 persistent Drawer 相同，未勾選時仍在 DOM（隱藏） */}
      <div
        hidden={!open}
        className={`ui-root noprint pointer-events-none fixed inset-x-0 bottom-6 z-[1200] justify-center px-4 ${open ? 'flex' : 'hidden'}`}
      >
        <div
          {...rest}
          role="toolbar"
          aria-label="批次操作"
          className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-solid border-border bg-background py-1.5 pl-4 pr-1.5 shadow-float"
        >
          <span className="mr-2 hidden text-label tabular-nums text-text sm:inline">
            已選取 {selectId.length} 筆項目
          </span>
          <span aria-hidden="true" className="mr-1 hidden h-5 w-px bg-border sm:inline-block" />
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
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
