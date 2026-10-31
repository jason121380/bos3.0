import ReservationContext from 'context/ReservationContext'
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

export default function ReservationForm() {
  const history = useHistory()
  const { merchantId, values, setValues, location } = React.useContext(ReservationContext)
  const [selectedDesigner, setSelectedDesigner] = React.useState('')
  const [bookingCategoryNames, setBookingCategoryNames] = React.useState([])
  const [isAssign, setIsAssign] = React.useState(false)
  const [isClickFriends, setIsClickFriends] = React.useState(false)
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
    ? values.merchantId && values.dateTime && values.designerId && values.customers.main.name && cellphoneRegex.test(values.customers.main.cellphone)
    : values.merchantId && values.dateTime && values.customers.main.name && cellphoneRegex.test(values.customers.main.cellphone)

  const isValidFriendsInput = Object.keys(values.customers)
    .filter(key => key !== 'main')
    .every(key =>
      isAssign
        ? values.customers[key].name && cellphoneRegex.test(values.customers[key].cellphone)
        : values.customers[key].name && cellphoneRegex.test(values.customers[key].cellphone)
    )

  // 預約鈕停用原因（STYLE.md §6）：與上方 isValidInput／isValidFriendsInput 同一組條件，只用於顯示
  const missingFields = [
    !values.merchantId && '店家',
    !values.dateTime && '服務時間',
    isAssign && !values.designerId && '服務設計師',
    !values.customers.main.name && '顧客姓名',
    !cellphoneRegex.test(values.customers.main.cellphone) && '顧客電話（09 開頭 10 碼）',
    !isValidFriendsInput && '同行友人的姓名與電話',
  ].filter(Boolean)

  const { booking } = useFetchBooking()
  const { nonDesignationBooking } = useFetchNonDesignationBooking()
  const handleChange = ({ key, value }) => {
    const _values = cloneDeep(values)
    setValues(
      produce(draft => {
        if (key === 'designerId') {
          // 若更換設計師，「服務時間」欄位清空
          draft.dateTime = ''
          // 若更換設計師，「服務項目」欄位清空
          Object.keys(_values.customers).map(key => (draft.customers[key].designerService = []))
          draft[key] = value
        } else {
          draft[key] = value
        }
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

          const service = isAssign
            ? values.customers.main.designerService.length !== 0
              ? values.customers.main.designerService.map(data => data.name).toString()
              : []
            : bookingCategoryNames.length !== 0
              ? (bookingCategoryNames.find(data => data.type === 'main')?.name ?? '')
              : []

          const messages = []
          if (data.nonDesignationBooking.status === '待審核') {
            messages.push({
              type: 'text',
              text: `
預約正在審核中...
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: ${isAssign ? selectedDesigner : '不指定'}
服務: ${service}
          `,
            })
          } else if (data.nonDesignationBooking.status === '預約成功') {
            messages.push({
              type: 'text',
              text: `
恭喜您！您已經預約成功囉！
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: ${isAssign ? selectedDesigner : '不指定'}
服務: ${service}`,
            })
          }
          if (getQueryString({ key: 'usingLineLogin', location }) === '1' || !getQueryString({ key: 'usingLineLogin', location })) {
            window.liff.closeWindow()
            window.liff.sendMessages(messages)
          }
          history.push('/management/reservation/calendar')
          openSnackbar({
            message: '預約成功',
            variant: 'success',
          })
        })
        .then(() => {
          setValues({
            ...values,
            merchantId,
            dateTime: '',
            reference: '',
            customers: Object.keys(values.customers).map(() => {
              return {
                name: '',
                cellphone: '',
                bookingCategoryId: '',
                designerService: [],
              }
            }),
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
          const service = isAssign
            ? values.customers.main.designerService.length !== 0
              ? values.customers.main.designerService.map(data => data.name).toString()
              : []
            : bookingCategoryNames.length !== 0
              ? (bookingCategoryNames.find(data => data.type === 'main')?.name ?? '')
              : []

          const messages = []
          if (data.bookingV2.status === '待審核') {
            messages.push({
              type: 'text',
              text: `
預約正在審核中...
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: ${isAssign ? selectedDesigner : '不指定'}
服務: ${service}`,
            })
          } else if (data.bookingV2.status === '預約成功') {
            messages.push({
              type: 'text',
              text: `
恭喜您！您已經預約成功囉！
以下是您的預約資訊:
姓名: ${values.customers.main.name}
電話: ${values.customers.main.cellphone}
預約日期: ${format(new Date(values.dateTime), 'yyyy/MM/dd')}
預約時間: ${format(new Date(values.dateTime), 'HH:mm')}
設計師: ${isAssign ? selectedDesigner : '不指定'}
服務: ${service}`,
            })
          }
          if (getQueryString({ key: 'usingLineLogin', location }) === '1' || !getQueryString({ key: 'usingLineLogin', location })) {
            window.liff.closeWindow()
            window.liff.sendMessages(messages)
          }
          history.push('/management/reservation/calendar')
          openSnackbar({
            message: '預約成功',
            variant: 'success',
          })
        })
        .then(() => {
          setValues({
            ...values,
            merchantId,
            dateTime: format(new Date(), 'yyyy/MM/dd'),
            reference: '',
            customers: Object.keys(values.customers).map(() => {
              return {
                name: '',
                cellphone: '',
                bookingCategoryId: '',
                designerService: [],
              }
            }),
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

  React.useEffect(() => {
    if (isClickFriends) {
      const timer = setTimeout(() => {
        setIsClickFriends(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isClickFriends])

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Basic assignDesigner={isAssign} onChange={handleChange} onAssignChange={handleAssignChange} onDesignerChange={handleDesignerChange} />

      {Object.keys(values.customers).map((customer, index) => (
        <Customer
          customerKey={customer}
          key={customer}
          customer={values.customers[customer]}
          friendsNumber={`${index}`}
          onDelete={e => {
            e.preventDefault()
            const newCustomers = cloneDeep(values.customers)
            delete newCustomers[customer]
            handleChange({
              key: 'customers',
              value: newCustomers,
            })
          }}
          cellphoneRegex={cellphoneRegex}
          onCustomerChange={({ value, customerKey }) => {
            const newCustomers = cloneDeep(values.customers)
            newCustomers[customer][customerKey] = value
            if (customerKey === 'cellphone' && value && !cellphoneRegex.test(value)) {
              newCustomers[customer].cellphoneErr = true
            } else {
              newCustomers[customer].cellphoneErr = false
            }

            handleChange({
              key: 'customers',
              value: newCustomers,
            })
          }}
        />
      ))}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="h-11 w-full"
        disabled={!isValidInput || !isValidFriendsInput || isDisabled}
        aria-describedby={missingFields.length > 0 && !isDisabled ? 'booking-missing' : undefined}
        data-testid="booking-submit"
      >
        預約
      </Button>
      {missingFields.length > 0 && !isDisabled && (
        <p id="booking-missing" role="status" className="text-center text-caption text-text-secondary">
          尚缺：{missingFields.join('、')}
        </p>
      )}
    </form>
  )
}
