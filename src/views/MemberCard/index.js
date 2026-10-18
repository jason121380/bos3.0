import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchUpdateCustomerType from 'hooks/useFetchUpdateCustomerType'
import { useLazyFetchCustomerProfile } from 'hooks/useFetchViewer'
import idx from 'idx'
import React from 'react'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'

export default function Reservation({ location }) {
  const history = useHistory()
  const { fetchCustomerProfile, customerProfile } = useLazyFetchCustomerProfile({})

  const [recommandCode, setRecommandCode] = React.useState('')

  const { updateCustomer } = useFetchUpdateCustomerType()

  const useFetchCustomerProfileRef = React.useRef(fetchCustomerProfile)

  React.useEffect(() => {
    if (!localStorage.getItem('customer')) {
      history.push(
        `/customer/login?merchantid=${getQueryString({
          key: 'merchantid',
          location,
        })}&redirect=/customer/member/card?merchantid=${getQueryString({
          key: 'merchantid',
          location,
        })}`
      )
      openSnackbar({
        message: '尚未登入',
        variant: 'warning',
      })
    } else {
      useFetchCustomerProfileRef.current()
    }
  }, [history, location])

  const user = idx(customerProfile, _ => _.data.viewer.customer)
  if (user && user.gender === 'UNKNOW') {
    history.push('/customer/member/create')
  }
  const handleSubmit = event => {
    event.preventDefault()
    updateCustomer(recommandCode).then(() => {
      openSnackbar({
        message: '已更新會員級別',
        variant: 'success',
      })
      setRecommandCode('')
    })
  }
  return (
    <div className="flex flex-col gap-4">
      {/* 會員卡圖片與疊字：圖片來源、寬度 100% 與疊字位置沿用舊版 */}
      <div className="relative overflow-hidden rounded-lg">
        {idx(customerProfile, _ => {
          let imgUrl = ''
          let text = ''

          if (_.data.viewer.customer.type === 'GOLD') {
            imgUrl = 'https://i.imgur.com/KKJv0TM.jpg'
          } else if (_.data.viewer.customer.type === 'PLATINUM') {
            imgUrl = 'https://i.imgur.com/bYYLUme.jpg'
            text = '10% off'
          } else if (_.data.viewer.customer.type === 'DIAMOND') {
            imgUrl = 'https://i.imgur.com/P84SfZc.jpg'
            text = '20% off'
          }
          return (
            <div>
              <img src={imgUrl} style={{ width: '100%' }} alt="" />
              <div className="absolute inset-x-0 bottom-20 text-center font-['Adam'] font-bold text-white">
                <p className="tabular-nums">
                  {_.data.viewer.customer.cellphone} | {_.data.viewer.customer.type}
                </p>
                <p style={{ top: '5px', position: 'relative' }}>{text}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Card>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field label="推薦碼" htmlFor="member-card-recommand-code">
              <Input
                id="member-card-recommand-code"
                className="h-11"
                type="text"
                placeholder="輸入推薦碼..."
                value={recommandCode}
                onChange={event => idx(event, _ => setRecommandCode(_.target.value))}
              />
            </Field>
            <Button type="submit" variant="primary" size="lg" className="h-11 w-full">
              送出
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
