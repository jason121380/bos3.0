import { Dialog } from 'ui/modal-compat'
import { Pencil } from 'lucide-react'
import PropTypes from 'prop-types'
import { useState } from 'react'
import useFetchSetCustomerIsUnwelcome from 'hooks/useFetchSetCustomerIsUnwelcome'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { gender } from 'types'
import useStore from 'hooks/useStore'
import ChoseEvent from './ChoseEvent'
import format from 'date-fns/format'
import { Button } from 'ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from 'ui/card'

import CustomerEditModal from './CustomerEditModal'

function CustomerInfo({ customer, className, isLoading, bookingCusCheck, ...rest }) {
  const { setCustomerIsUnwelcome } = useFetchSetCustomerIsUnwelcome()
  const { refetch } = useStore()
  const [openEdit, setOpenEdit] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const handleEditOpen = () => {
    setOpenEdit(true)
  }

  const handleEditClose = () => {
    setOpenEdit(false)
  }

  const handleSetIsUnwelcome = async () => {
    setIsClick(true)
    try {
      const returnData = await setCustomerIsUnwelcome({
        input: !customer.isUnwelcome,
        customerId: customer.id
      })
      // 依 mutation 回傳的實際結果判斷（原本判斷整個回應物件，後端回 false 仍提示成功；Jason 2026/10/22 fix all）
      if (idx(returnData, _ => _.data.setCustomerIsUnwelcome)) {
        openSnackbar({
          message: '設定成功',
          variant: 'success'
        })
        refetch()
      } else {
        openSnackbar({
          message: '設定失敗',
          variant: 'warning'
        })
      }
      setIsClick(false)
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      setIsClick(false)
    }
  }
  // 基本資料欄位列（純顯示）
  const Row = ({ label, children }) => (
    <div className="flex gap-4 border-0 border-b border-solid border-border px-5 py-2.5 last:border-b-0">
      <dt className="w-28 shrink-0 text-label text-text-secondary">{label}</dt>
      <dd className="m-0 min-w-0 break-words text-body text-text">{children}</dd>
    </div>
  )
  return (
    <Card {...rest} className={className}>
      <CardHeader className="pb-4">
        <CardTitle>基本資料</CardTitle>
      </CardHeader>
      <dl className="m-0 border-0 border-t border-solid border-border">
        <Row label="客戶編號">{customer.no}</Row>
        <Row label="姓名">{customer.name}</Row>
        <Row label="性別">{gender[customer.gender] || customer.gender}</Row>
        <Row label="Email">{customer.email}</Row>
        <Row label="LineID">{customer.lineId}</Row>
        <Row label="客戶暱稱">{customer.nickName}</Row>
        <Row label="生日">{customer.birthday ? `${customer.birthday.year}/${customer.birthday.month}/${customer.birthday.day}` : ''}</Row>
        {/* <TableRow>
          <TableCell>客戶類別</TableCell>
          <TableCell>{customer.category}</TableCell>
        </TableRow> */}
        <Row label="電話">{customer.cellphone}</Row>
        <Row label="地址">{customer.address}</Row>
        <Row label="客戶來源">{customer.source !== null ? customer.source : ''}</Row>
        <Row label="最近設計師">{customer.latestDesigner ? customer.latestDesigner.name : ''}</Row>
        <Row label="偏好設計師">{customer.preferDesigner ? customer.preferDesigner.name : ''}</Row>
        <Row label="備註">{customer.remark}</Row>
        <Row label="客資建立時間">{format(customer.createdAt, 'yyyy/MM/dd')}</Row>
      </dl>
      <CardFooter className="flex-wrap justify-between">
        <Button variant="ghost" onClick={handleEditOpen}>
          <Pencil strokeWidth={1.75} />
          編輯
        </Button>
        <Button variant="primary" onClick={() => setModalOpen(true)}>建立預約</Button>
        <Button
          variant={!customer.isUnwelcome ? 'ghost' : 'danger'}
          className={!customer.isUnwelcome ? 'text-danger hover:bg-danger/8' : undefined}
          onClick={handleSetIsUnwelcome}
          disabled={isLoading || isClick}
        >
          {customer.isUnwelcome ? '解除黑名單' : '設為黑名單'}
        </Button>
      </CardFooter>
      {openEdit ? (
        <CustomerEditModal customer={customer} onClose={handleEditClose} open={openEdit} />
      ) : (
        ''
      )}
      {/* MUI Dialog 保留：舊版無 onClose，內含 MUI 日期選擇器、Select、Autocomplete */}
      <Dialog open={modalOpen}>
        <ChoseEvent
          bookingCusCheck={bookingCusCheck}
          modalOpen={modalOpen}
          cellphone={customer.cellphone}
          setModalOpen={setModalOpen}
        />
      </Dialog>
    </Card>
  )
}

CustomerInfo.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.object.isRequired,
}

export default CustomerInfo
