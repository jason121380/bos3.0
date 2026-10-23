import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCustomerVerifySMS from 'hooks/useFetchCustomerVerifySMS'
import useFetchLoginSMS from 'hooks/useFetchLoginSMS'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'

export default function Reservation(props) {
  const { loginSMS } = useFetchLoginSMS()
  const { verifySMS } = useFetchCustomerVerifySMS()
  const [openSNSCode, setOpenSMSCode] = React.useState(false)
  const history = useHistory()

  function getQueryStringValue(key) {
    return decodeURIComponent(
      props.location.search.replace(
        new RegExp(
          '^(?:.*[&\\?]' +
          encodeURIComponent(key).replace(/[.+*]/g, '\\$&') +
          '(?:\\=([^&]*))?)?.*$',
          'i'
        ),
        '$1'
      )
    )
  }

  const useGetQueryStringValueRef = React.useRef(getQueryStringValue)

  React.useEffect(() => {
    // localStorage 存的是 JSON 字串：解析後再讀 userCode；導向寫法與登入成功後相同
    // （原本直接讀字串的 userCode，已登入的顧客從不自動導回；Jason 2026/10/22 fix all）
    let customer = null
    try {
      customer = JSON.parse(localStorage.getItem('customer'))
    } catch (error) {
      customer = null
    }
    if (customer && customer.userCode) {
      history.push(`${useGetQueryStringValueRef.current('redirect')}`)
    }
  }, [history])

  const [values, setValues] = React.useState({
    merchantId: useGetQueryStringValueRef.current('merchantid'),
    code: '',
    cellphone: '',
  })
  const handleChange = ({ key, value }) => {
    setValues(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleSubmit = event => {
    event.preventDefault()
    if (!values.code) {
      loginSMS({
        cellphone: values.cellphone,
        merchantId: values.merchantId,
      }).then(() => {
        openSnackbar({
          message: '已傳送驗證碼',
          variant: 'success',
        })
        setOpenSMSCode(true)
      })
    }
    if (values.code) {
      verifySMS(values).then(({ data }) => {
        localStorage.setItem('customer', JSON.stringify(data.customerVerifySMS))
        openSnackbar({ message: '登入成功', variant: 'success' })
        history.push(`${getQueryStringValue('redirect')}`)
      })
    }
  }

  return (
    <Page className="ui-root flex flex-col gap-4" title="預約服務">
      {/* <Header /> */}
      <h1 className="text-title !font-bold text-text">顧客登入</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Field label="電話" htmlFor="customer-login-cellphone">
              <Input
                id="customer-login-cellphone"
                className="h-11"
                value={values.cellphone}
                placeholder="電話"
                onChange={event =>
                  handleChange({
                    key: 'cellphone',
                    value: idx(event, _ => _.target.value),
                  })
                }
                disabled={openSNSCode}
              />
            </Field>
            {openSNSCode ? (
              <Field label="驗證碼" htmlFor="customer-login-code">
                <Input
                  id="customer-login-code"
                  className="h-11"
                  type="number"
                  value={values.code}
                  placeholder="驗證碼"
                  onChange={event =>
                    handleChange({
                      key: 'code',
                      value: idx(event, _ => _.target.value),
                    })
                  }
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>
            ) : (
              ''
            )}
            <Button type="submit" variant="primary" size="lg" className="h-11 w-full">
              {!openSNSCode ? '獲取驗證碼' : '登入'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Page>
  )
}
