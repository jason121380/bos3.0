/** @jsxImportSource @emotion/react */
// 表格列保留 MUI TableBody / TableRow / TableCell：外框為共用元件 components/ManagementTable（MUI Table）
// 刪除確認保留 MUI Dialog：舊版刻意不設 onClose（點背景、Esc 不關閉）
import {
  Link,
  TableBody,
  TableCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { Pencil } from 'lucide-react'
import ManagementTable from 'components/ManagementTable'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Field, Input } from 'ui/input'

const styles = {
  root: css({}),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 32,
    width: 32,
    marginRight: theme.spacing(1),
    background: '#757575',
    fontSize: '14px'
  }),
  compactCell: css({
    padding: '4px 8px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  unWelcome: css({
    '& td': {
      color: 'red !important',
      '& a.MuiTypography-root': {
        color: 'red !important'
      }
    }
  })
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
    <div {...rest} css={css([styles.root, className])}>
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
            <TableCell padding="checkbox" css={styles.compactCell}>
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
            </TableCell>
            <TableCell css={styles.compactCell}>編輯</TableCell>
            <TableCell css={styles.compactCell}>姓名</TableCell>
            <TableCell css={styles.compactCell}>最近設計師</TableCell>
            <TableCell css={styles.compactCell}>偏好設計師</TableCell>
            <TableCell css={styles.compactCell}>上次消費日期</TableCell>
            <TableCell css={styles.compactCell}>性別</TableCell>
            <TableCell css={styles.compactCell}>生日</TableCell>
            <TableCell css={styles.compactCell}>電話</TableCell>
            <TableCell css={styles.compactCell}>客戶來源</TableCell>
          </>
        }
      >
        <TableBody>
          {customers.map(data => (
            <TableRow
              css={css([data.isUnwelcome ? styles.unWelcome : {}])}
              hover
              key={`customer-${data.id}`}
              selected={selectedCustomers.indexOf(data.id) > -1}
            >
              <TableCell padding="checkbox" css={styles.compactCell}>
                <Checkbox
                  aria-label={`選取 ${data.name}`}
                  checked={selectedCustomers.indexOf(data.id) > -1}
                  onChange={() => handleSelectOne(data.id)}
                />
              </TableCell>
              <TableCell css={styles.compactCell}>
                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                  <RouterLink
                    aria-label="編輯客戶"
                    to={`/management/customers/${data.id}/general?backto=customer-filter`}
                  >
                    <Pencil strokeWidth={1.75} />
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell css={styles.compactCell}>
                <div css={styles.nameCell}>
                  <span aria-hidden="true" className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-label text-text-secondary">
                    {data.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <Link
                      color="inherit"
                      component={RouterLink}
                      underline='none'
                      to={`/management/customers/${data.id}/general?backto=customer-filter`}
                      variant="h6"
                    >
                      {data.name}
                    </Link>
                    <div className="text-caption tabular-nums text-text-secondary">
                      {data.no ? data.no : ''}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>{idx(data, _ => _.latestDesigner.name)}</TableCell>
              <TableCell css={styles.compactCell}>{idx(data, _ => _.preferDesigner.name)}</TableCell>
              <TableCell css={styles.compactCell}>
                {data.lastTime ? format(data.lastTime, 'yyyy/MM/dd') : ''}
              </TableCell>
              <TableCell css={styles.compactCell}>{gender[data.gender]}</TableCell>
              <TableCell css={styles.compactCell}>
                {data.birthday ? `${data.birthday.year}/${data.birthday.month}/${data.birthday.day}` : ''}
              </TableCell>
              <TableCell css={styles.compactCell}>{data.cellphone}</TableCell>
              <TableCell css={styles.compactCell}>{data.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ManagementTable>
      <TableEditBar
        selected={selectedCustomers}
        onDeleteCustomer={deleteCustomerIsUsing ? handleOpenDialog : handeleteCustomer}
      />
      <Dialog
        open={openDialog}
        // onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'刪除客人'}</DialogTitle>
        <DialogContent className="ui-root" style={{ overflow: 'visible' }}>
          <div id="alert-dialog-description" className="flex flex-col gap-4">
            <p className="m-0 text-body text-text-secondary">刪除後客戶資料將無法復原，請輸入刪除密碼確認。</p>
            <Field label="刪除密碼" htmlFor="delete-customer-password">
              <Input
                id="delete-customer-password"
                type="password"
                value={deletePwd}
                onChange={event => setDeletePwd(event.target.value)}
                data-testid="delete-password"
              />
            </Field>
          </div>
        </DialogContent>
        <DialogActions className="ui-root">
          <Button variant="secondary" onClick={handleCloseDialog}>
            取消
          </Button>
          <Button variant="danger" autoFocus data-testid="confirm" onClick={handeleteCustomer}>
            確認
          </Button>
        </DialogActions>
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
