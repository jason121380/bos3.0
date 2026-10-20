// 表格列使用 ui/table（外框 components/ManagementTable 亦為 ui/table）
// 刪除確認已換 ui/dialog：舊版不設 onClose（點背景、Esc 不關閉），故不傳 onOpenChange
import { Pencil } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteCustomer from 'hooks/useFetchDeleteCustomer'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { gender } from 'types'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { format } from 'date-fns'
import ManagementTable from 'components/ManagementTable'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Field, Input } from 'ui/input'

function Results({
  className = '',
  customers,
  pageLimit,
  pageOffset,
  refetch,
  totalCount,
  onPageChange,
  isMemberShipCardActive,
  ...rest
}) {
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [deletePwd, setDeletePwd] = useState('')
  const [deleteCustomerIsUsing, setDeleteCustomerIsUsing] = useState(false)
  const [clickComfirmBtn, setClickComfirmBtn] = useState(false)

  const merchantPassword = useFetchMerchantPassword()
  const { deleteCustomers } = useFetchDeleteCustomer()

  useEffect(() => {
    if (!merchantPassword.loading) {
      const isUsing = idx(merchantPassword, _ => _.data.merchantPassword.deleteCustomer.isUsing)
      setDeleteCustomerIsUsing(isUsing)
    }
  }, [merchantPassword.loading])

  const handleSelectAll = event => {
    const newSelected = event.target.checked ? customers.map(customer => customer.id) : []
    setSelectedCustomers(newSelected)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedCustomers], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCustomers(newSelect)
  }

  const handlePageChangeInternal = (_event, nextPage) => {
    onPageChange({ value: nextPage, key: 'pageOffset' })
    refetch()
  }

  const handleRowsPerPageChangeInternal = event => {
    onPageChange({ value: event.target.value, key: 'pageLimit' })
    refetch()
  }

  const handeleteCustomer = () => {
    setClickComfirmBtn(true)
    openSnackbar({ message: '刪除客戶中', variant: 'warning' })
    deleteCustomers({ customerIds: selectedCustomers, password: deletePwd })
      .then(() => {
        setOpenDialog(false)
        setDeletePwd('')
        setSelectedCustomers([])
        refetch()
        openSnackbar({ message: '成功刪除客戶', variant: 'success' })
      })
      .catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
        setClickComfirmBtn(false)
      })
  }

  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedCustomers([])
    setDeletePwd('')
  }

  return (
    <div {...rest} className={className}>
      <ManagementTable
        title="所有客戶列表"
        totalCount={totalCount}
        pageLimit={pageLimit}
        pageOffset={pageOffset}
        onPageChange={handlePageChangeInternal}
        onRowsPerPageChange={handleRowsPerPageChangeInternal}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        minWidth={1100}
        size="small"
        tableHead={
          <>
            <TableHead className="w-12 whitespace-nowrap">
              <Checkbox
                aria-label="全選"
                checked={selectedCustomers.length === customers.length && customers.length > 0}
                indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < customers.length}
                onChange={handleSelectAll}
                disabled={customers.length === 0}
              />
            </TableHead>
            <TableHead className="whitespace-nowrap">編輯</TableHead>
            <TableHead className="whitespace-nowrap">姓名</TableHead>
            <TableHead className="whitespace-nowrap">電話</TableHead>
            <TableHead className="whitespace-nowrap">客戶編號</TableHead>
            <TableHead className="whitespace-nowrap">最近設計師</TableHead>
            <TableHead className="whitespace-nowrap">偏好設計師</TableHead>
            <TableHead className="whitespace-nowrap">上次消費日期</TableHead>
            {isMemberShipCardActive && <TableHead className="whitespace-nowrap">會員卡</TableHead>}
            <TableHead className="whitespace-nowrap">性別</TableHead>
            <TableHead className="whitespace-nowrap">生日</TableHead>
            <TableHead className="whitespace-nowrap">客戶來源</TableHead>
          </>
        }
      >
        <TableBody>
          {customers.map(data => (
            <TableRow
              className="!bg-background hover:!bg-background"
              key={`customer-${data.id}`}
              data-state={(selectedCustomers.indexOf(data.id) > -1) ? 'selected' : undefined}
            >
              <TableCell className="w-12 whitespace-nowrap">
                <Checkbox
                  aria-label={`選取 ${data.name}`}
                  checked={selectedCustomers.indexOf(data.id) > -1}
                  onChange={() => handleSelectOne(data.id)}
                />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                  <RouterLink
                    aria-label="編輯客戶"
                    to={`/management/customers/${data.id}`}
                  >
                    <Pencil strokeWidth={1.75} />
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center">
                  <span aria-hidden="true" className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-label text-text-secondary">
                    {data.name.charAt(0).toUpperCase()}
                  </span>
                  <RouterLink
                    className="font-medium text-text no-underline"
                    to={`/management/customers/${data.id}`}
                  >
                    {data.name}
                  </RouterLink>
                  {/* 黑名單：原本整列紅字（只靠顏色、寫死 red），改姓名旁 danger 徽章 */}
                  {data.isUnwelcome && <Badge variant="danger" className="ml-2">黑名單</Badge>}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">{data.cellphone}</TableCell>
              <TableCell className="whitespace-nowrap">{data.no ? data.no : ''}</TableCell>
              <TableCell className="whitespace-nowrap">{idx(data, _ => _.latestDesigner.name)}</TableCell>
              <TableCell className="whitespace-nowrap">{idx(data, _ => _.preferDesigner.name)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {data.lastTime ? format(data.lastTime, 'yyyy/MM/dd') : ''}
              </TableCell>
              {isMemberShipCardActive && (
                <TableCell className="min-w-[180px] text-caption">
                  {data.membershipPurchaseRecord && data.membershipPurchaseRecord.length > 0 && (
                    <div key={data.membershipPurchaseRecord.length - 1}>
                      <div>{data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].membershipName}</div>
                      <div>效期： {data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].expiryDay ? format(data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].expiryDay, 'yyyy/MM/dd') : "永久"}</div>
                      {data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].remark && <div>備註： {data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].remark}</div>}
                    </div>
                  )}
                </TableCell>
              )}
              <TableCell className="whitespace-nowrap">{gender[data.gender]}</TableCell>
              <TableCell className="whitespace-nowrap">
                {data.birthday ? `${data.birthday.year}/${data.birthday.month}/${data.birthday.day}` : ''}
              </TableCell>
              <TableCell className="whitespace-nowrap">{data.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ManagementTable>

      <TableEditBar
        selected={selectedCustomers}
        onDeleteCustomer={deleteCustomerIsUsing ? handleOpenDialog : handeleteCustomer}
      />

      <Dialog open={openDialog}>
        <DialogContent size="sm" hideClose aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogHeader>
            <DialogTitle id="alert-dialog-title">{'刪除客人'}</DialogTitle>
            <DialogDescription id="alert-dialog-description">刪除後客戶資料將無法復原，請輸入刪除密碼確認。</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="刪除密碼" htmlFor="delete-customer-password">
              <Input
                id="delete-customer-password"
                type="password"
                value={deletePwd}
                onChange={event => setDeletePwd(event.target.value)}
                data-testid="delete-password"
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseDialog} disabled={clickComfirmBtn}>取消</Button>
            <Button variant="danger" autoFocus onClick={handeleteCustomer} disabled={clickComfirmBtn}>確認</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
  pageLimit: PropTypes.number,
  pageOffset: PropTypes.number,
  refetch: PropTypes.func,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  isMemberShipCardActive: PropTypes.bool,
}

Results.defaultProps = {
  customers: [],
}

export default Results
