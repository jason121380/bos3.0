/** @jsxImportSource @emotion/react */
import { Button, TextField } from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchUpdateCustomerType from 'hooks/useFetchUpdateCustomerType'
import { useLazyFetchCustomerProfile } from 'hooks/useFetchViewer'
import idx from 'idx'
import React from 'react'
import { useHistory } from 'react-router'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

const StyledForm = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 16px;
  & > *:first-child {
    margin-right: 12px;
  }
`

const styles = {
  root: css({
    position: 'relative',
  }),
  text: css({
    position: 'absolute',
    bottom: '80px',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Adam',
    color: 'white',
    fontWeight: 'bold',
  }),
}
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
    <React.Fragment>
      <div css={styles.root}>
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
              <p css={styles.text}>
                <p>
                  {_.data.viewer.customer.cellphone} | {_.data.viewer.customer.type}
                </p>
                <p style={{ top: '5px', position: 'relative' }}>{text}</p>
              </p>
            </div>
          )
        })}
      </div>
      <StyledForm onSubmit={handleSubmit}>
        <TextField
          type="text"
          placeholder="輸入推薦碼..."
          variant="outlined"
          value={recommandCode}
          onChange={event => idx(event, _ => setRecommandCode(_.target.value))}
        />
        <Button type="submit" variant="outlined" color="primary">
          送出
        </Button>
      </StyledForm>
    </React.Fragment>
  )
}
