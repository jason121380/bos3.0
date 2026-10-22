import useReservationContext from 'context/useReservationContext'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchBooking from 'hooks/useFetchBooking'
import useFetchNonDesignationBooking from 'hooks/useFetchNonDesignationBooking'
import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button } from 'ui/button'

import Basic from './Basic'
import Customer from './Customer'

export default function () {
  const history = useHistory()
  const { values, setValues, location } = React.useContext(useReservationContext)
  const [selectedDesigner, setSelectedDesigner] = React.useState('')
  const [isAssign, setIsAssign] = React.useState(false)
  const [isDisabled, setDisabled] = React.useState(false)

  React.useEffect(() => {
    setIsAssign(!!values.designerId)
    return () => {
      setIsAssign(false)
    }
  }, [values.designerId])

  const handleAssignChange = (_event, newAlignment) => {
    if (newAlignment !== null) {
      setIsAssign(newAlignment)
      const _dateTime = cloneDeep(values.dateTime)
      setValues({
        ...values,
        dateTime: new Date(_dateTime).getTime(),
      })
    }
  }
  const cellphoneRegex = new RegExp('^09[0-9]{8}$')
  const isValidInput = isAssign
    ? values.merchantId &&
      values.dateTime &&
      values.designerId &&
      values.customers.main.name &&
      cellphoneRegex.test(values.customers.main.cellphone)
    : values.merchantId &&
      values.dateTime &&
      values.customers.main.name &&
      cellphoneRegex.test(values.customers.main.cellphone)

  const { booking } = useFetchBooking()
  const { nonDesignationBooking } = useFetchNonDesignationBooking()
  const handleChange = ({ key, value }) => {
    setValues(
      produce(draft => {
        // 若更換設計師，「服務時間」欄位清空
        if (key === 'designerId') draft.dateTime = ''
        draft[key] = value
      })
    )
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const bookingData = {
      lineId: values.lineId,
      merchantId: values.merchantId,
      dateTime: values.dateTime,
      designerId: isAssign ? values.designerId : null,
      name: values.customers.main.name,
      cellphone: values.customers.main.cellphone,
    }
    if (bookingData.designerId === null) {
      setDisabled(true)
      const input = {
        bookingDate: bookingData.dateTime,
        cellphone: bookingData.cellphone,
        customerName: bookingData.name,
        storeId: bookingData.merchantId,
      }
      nonDesignationBooking(input)
        .then(async ({ data }) => {
          localStorage.setItem(
            'customer',
            JSON.stringify({
              name: values.customers.main.name,
              cellphone: values.customers.main.cellphone,
            })
          )

          // 頁面沒有選服務項目的欄位，訊息的「服務」維持原本的空白；不指定預約的設計師一律「不指定」
          const service = ''

          const messaes = []
          if (data.nonDesignationBooking.status === '待審核') {
            messaes.push({
              type: 'text',
              text: `
預約正在審核中...
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: 不指定
服務: ${service}
          `,
            })
          } else if (data.nonDesignationBooking.status === '預約成功') {
            messaes.push({
              type: 'text',
              text: `
恭喜您！您已經預約成功囉！
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: 不指定
服務: ${service}`,
            })
          }
          if (
            getQueryString({ key: 'usingLineLogin', location }) === '1' ||
            !getQueryString({ key: 'usingLineLogin', location })
          ) {
            window.liff.closeWindow()
            window.liff.sendMessages(messaes)
          }
          history.push('/management/reservation/calendar')
          openSnackbar({
            message: '預約成功',
            variant: 'success',
          })
        })
        .catch(err => {
          // GraphQL／網路錯誤已由 init-apollo 的 errorLink 提示；其餘（例如傳回 LINE 失敗）在這裡提示，不再拋出（Jason 2026/10/22 fix all）
          if (!(err.graphQLErrors && err.graphQLErrors.length) && !err.networkError) {
            openSnackbar({ message: err.message, variant: 'error' })
          }
        })
        .finally(() => {
          setDisabled(false)
        })
    } else {
      setDisabled(true)
      booking(bookingData)
        .then(async ({ data }) => {
          localStorage.setItem(
            'customer',
            JSON.stringify({
              name: values.customers.main.name,
              cellphone: values.customers.main.cellphone,
            })
          )
          // 頁面沒有選服務項目的欄位，訊息的「服務」維持原本的空白；指定預約一律帶選定的設計師
          const service = ''

          const messaes = []
          if (data.bookingV2.status === '待審核') {
            messaes.push({
              type: 'text',
              text: `
預約正在審核中...
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: ${selectedDesigner}
服務: ${service}`,
            })
          } else if (data.bookingV2.status === '預約成功') {
            messaes.push({
              type: 'text',
              text: `
恭喜您！您已經預約成功囉！
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: ${selectedDesigner}
服務: ${service}`,
            })
          }
          if (
            getQueryString({ key: 'usingLineLogin', location }) === '1' ||
            !getQueryString({ key: 'usingLineLogin', location })
          ) {
            window.liff.closeWindow()
            window.liff.sendMessages(messaes)
          }
          history.push('/management/reservation/calendar')
          openSnackbar({
            message: '預約成功',
            variant: 'success',
          })
        })
        .catch(err => {
          // GraphQL／網路錯誤已由 init-apollo 的 errorLink 提示；其餘（例如傳回 LINE 失敗）在這裡提示，不再拋出（Jason 2026/10/22 fix all）
          if (!(err.graphQLErrors && err.graphQLErrors.length) && !err.networkError) {
            openSnackbar({ message: err.message, variant: 'error' })
          }
        })
        .finally(() => {
          setDisabled(false)
        })
    }
  }

  const handleDesignerChange = name => {
    setSelectedDesigner(name)
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Basic
        asignDesigner={isAssign}
        onChange={handleChange}
        onAssignChange={handleAssignChange}
        onDesignerChange={handleDesignerChange}
      />

      {/* 只有預約人本人（main）：原本預留的「好友」欄位沒有新增入口，已移除 */}
      <Customer
        customer={values.customers.main}
        onCustomerChange={({ value, customerKey }) => {
          const newCustomers = cloneDeep(values.customers)
          newCustomers.main[customerKey] = value
          newCustomers.main.cellphoneErr = customerKey === 'cellphone' && !!value && !cellphoneRegex.test(value)
          handleChange({
            key: 'customers',
            value: newCustomers,
          })
        }}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="h-11 w-full"
        disabled={!isValidInput || isDisabled}
        data-testid="booking-submit"
      >
        預約
      </Button>
    </form>
  )
}
