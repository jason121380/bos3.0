/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Dialog
} from '@mui/material'
import { Edit as EditIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import { useState } from 'react'
import useFetchSetCustomerIsUnwelcome from 'hooks/useFetchSetCustomerIsUnwelcome'
import { openSnackbar } from 'elements/snackbars'
import useStore from 'hooks/useStore'
import { css } from '@emotion/react'
import { theme } from '../../../theme'
import ChoseEvent from './ChoseEvent'
import format from 'date-fns/format'

import CustomerEditModal from './CustomerEditModal'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  actions: css({
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    '& > * + *': {
      marginLeft: 0,
    },
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
}

function CustomerInfo({ customer, className = {}, isLoading, bookingCusCheck, ...rest }) {
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
      if (returnData) {
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
  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="基本資料" />
      <Divider />
      <CardContent css={styles.content}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>客戶編號</TableCell>
              <TableCell>{customer.no}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>姓名</TableCell>
              <TableCell>{customer.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>性別</TableCell>
              <TableCell>{customer.gender === 'UNKNOWN' ? '未知' : customer.gender}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>{customer.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>LineID</TableCell>
              <TableCell>{customer.lineId}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>客戶暱稱</TableCell>
              <TableCell>{customer.nickName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>生日</TableCell>
              <TableCell>{customer.birthday ? `${customer.birthday.year}/${customer.birthday.month}/${customer.birthday.day}` : ''}</TableCell>
            </TableRow>
            {/* <TableRow>
              <TableCell>客戶類別</TableCell>
              <TableCell>{customer.category}</TableCell>
            </TableRow> */}
            <TableRow>
              <TableCell>電話</TableCell>
              <TableCell>{customer.cellphone}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>地址</TableCell>
              <TableCell>{customer.address}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>客戶來源</TableCell>
              <TableCell>{customer.source !== null ? customer.source : ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>最近設計師</TableCell>
              <TableCell>{customer.latestDesigner ? customer.latestDesigner.name : ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>偏好設計師</TableCell>
              <TableCell>{customer.preferDesigner ? customer.preferDesigner.name : ''}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>備註</TableCell>
              <TableCell>{customer.remark}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>客資建立時間</TableCell>
              <TableCell>{format(customer.createdAt, 'yyyy/M/d')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardActions css={styles.actions}>
        <Button onClick={handleEditOpen}>
          <EditIcon css={styles.buttonIcon} />
          編輯
        </Button>
        <Button variant='contained' onClick={() => setModalOpen(true)}>建立預約</Button>
        <Button
          color='error'
          variant={!customer.isUnwelcome ? 'outlined' : 'contained'}
          onClick={handleSetIsUnwelcome}
          disabled={isLoading || isClick}
        >
          {customer.isUnwelcome ? '解除黑名單' : '設為黑名單'}
        </Button>
      </CardActions>
      {openEdit ? (
        <CustomerEditModal customer={customer} onClose={handleEditClose} open={openEdit} />
      ) : (
        ''
      )}
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
  className: PropTypes.object,
  customer: PropTypes.object.isRequired,
}

export default CustomerInfo
