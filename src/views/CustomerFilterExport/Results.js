// 表格列使用 ui/table（外框 components/ManagementTable 亦為 ui/table）
// 刪除確認已換 ui/dialog：舊版刻意不設 onClose（點背景、Esc 不關閉），故不傳 onOpenChange
import { Pencil } from 'lucide-react'
import ManagementTable from 'components/ManagementTable'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteCustomer from 'hooks/useFetchDeleteCustomer'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { gender } from 'types'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Field, Input } from 'ui/input'

const styles = {
  nameCell: 'flex items-center',
  compactCell: '![padding:4px_8px] !text-[13px] whitespace-nowrap',
  unWelcome: '[&_td]:!text-[red]',
}

function Results({
  className,
  customers,
  pageLimit,
  pageOffset,
  refetch,
  totalCount,
  onPageChange,
  ...rest
}) {
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [deletePwd, setDeletePwd] = useState('')
  const [deleteCustomerIsUsing, setDeleteCustomerIsUsing] = useState(false)
  const merchantPassword = useFetchMerchantPassword()
  const pageRef = useRef(null)

  const { deleteCustomers } = useFetchDeleteCustomer()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? customers.map(customer => customer.id) : []
    setSelectedCustomers(newSelectedPayment)
  }


  useEffect(() => {
    if (!merchantPassword.loading) {
      const deleteCustomerIsUsing = idx(
        merchantPassword,
        _ => _.data.merchantPassword.deleteCustomer.isUsing
      )
      setDeleteCustomerIsUsing(deleteCustomerIsUsing)
    }
  }, [merchantPassword.loading])

  const handleSelectOne = id => {
    const newSelect = [...selectedCustomers], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCustomers(newSelect)
  }

  const handleOnChangePage = (_event, nextPage) => {
    onPageChange({
      value: nextPage,
      key: 'pageOffset',
    })
    refetch()
  }

  const handleOnChangeRowsPerPage = event => {
    onPageChange({
      value: event.target.value,
      key: 'pageLimit',
    })
    refetch()
  }

  const handeleteCustomer = () => {
    deleteCustomers({ customerIds: selectedCustomers, password: deletePwd }).then(() => {
      setOpenDialog(false)
      setDeletePwd('')
      setSelectedCustomers([])
      refetch()
      openSnackbar({
        message: '成功刪除客戶',
        variant: 'success',
      })
    })
  }

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }
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
        onPageChange={handleOnChangePage}
        onRowsPerPageChange={handleOnChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 500, 1000]}
        minWidth={700}
        size="small"
        tableHead={
          <>
            <TableHead className={`w-12 ${styles.compactCell}`}>
              <Checkbox
                aria-label="全選"
                checked={
                  selectedCustomers.length === customers.length && customers.length > 0
                }
                indeterminate={
                  selectedCustomers.length > 0 &&
                  selectedCustomers.length < customers.length
                }
                onChange={handleSelectAll}
                disabled={customers.length === 0}
              />
            </TableHead>
            <TableHead className={styles.compactCell}>編輯</TableHead>
            <TableHead className={styles.compactCell}>姓名</TableHead>
            <TableHead className={styles.compactCell}>最近設計師</TableHead>
            <TableHead className={styles.compactCell}>偏好設計師</TableHead>
            <TableHead className={styles.compactCell}>上次消費日期</TableHead>
            <TableHead className={styles.compactCell}>性別</TableHead>
            <TableHead className={styles.compactCell}>生日</TableHead>
            <TableHead className={styles.compactCell}>電話</TableHead>
            <TableHead className={styles.compactCell}>客戶來源</TableHead>
          </>
        }
      >
        <TableBody>
          {customers.map(data => (
            <TableRow
              className={data.isUnwelcome ? styles.unWelcome : undefined}
              hover
              key={`customer-${data.id}`}
              data-state={(selectedCustomers.indexOf(data.id) > -1) ? 'selected' : undefined}
            >
              <TableCell className={`w-12 ${styles.compactCell}`}>
                <Checkbox
                  aria-label={`選取 ${data.name}`}
                  checked={selectedCustomers.indexOf(data.id) > -1}
                  onChange={() => handleSelectOne(data.id)}
                />
              </TableCell>
              <TableCell className={styles.compactCell}>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                  <RouterLink
                    aria-label="編輯客戶"
                    to={`/management/customers/${data.id}/general?backto=customer-filter`}
                  >
                    <Pencil strokeWidth={1.75} />
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell className={styles.compactCell}>
                <div className={styles.nameCell}>
                  <span aria-hidden="true" className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-label text-text-secondary">
                    {data.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <RouterLink
                      className="font-medium text-text no-underline"
                      to={`/management/customers/${data.id}/general?backto=customer-filter`}
                    >
                      {data.name}
                    </RouterLink>
                    <div className="text-caption tabular-nums text-text-secondary">
                      {data.no ? data.no : ''}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className={styles.compactCell}>{idx(data, _ => _.latestDesigner.name)}</TableCell>
              <TableCell className={styles.compactCell}>{idx(data, _ => _.preferDesigner.name)}</TableCell>
              <TableCell className={styles.compactCell}>
                {data.lastTime ? format(data.lastTime, 'yyyy/MM/dd') : ''}
              </TableCell>
              <TableCell className={styles.compactCell}>{gender[data.gender]}</TableCell>
              <TableCell className={styles.compactCell}>
                {data.birthday ? `${data.birthday.year}/${data.birthday.month}/${data.birthday.day}` : ''}
              </TableCell>
              <TableCell className={styles.compactCell}>{data.cellphone}</TableCell>
              <TableCell className={styles.compactCell}>{data.source}</TableCell>
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
            <Button variant="secondary" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button variant="danger" autoFocus data-testid="confirm" onClick={handeleteCustomer}>
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
