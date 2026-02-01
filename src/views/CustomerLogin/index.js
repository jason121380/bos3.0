/** @jsxImportSource @emotion/react */
import { TextField, Button, Card, CardActions, CardContent } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchCustomerVerifySMS from 'hooks/useFetchCustomerVerifySMS'
import useFetchLoginSMS from 'hooks/useFetchLoginSMS'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4)
  }),
  pageTitle: {
    marginBottom: theme.spacing(3)
  },
  field: css({
    marginBottom: theme.spacing(2),
  }),
  bullet: css({
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  }),
  title: css({
    fontSize: 14,
  }),
  pos: css({
    marginBottom: 12,
  }),
}

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
    const customer = localStorage.getItem('customer') || ''
    if (customer && customer.userCode) {
      history.push(`/${useGetQueryStringValueRef.current('redirect')}`)
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
    <Page css={styles.root} title="預約服務">
      {/* <Header /> */}
      <PageTitle className={styles.pageTitle} title='顧客登入' subTitle='Customer Login' />
      <form onSubmit={handleSubmit}>
        <Card css={styles.root}>
          <CardContent>
            <TextField
              value={values.cellphone}
              css={styles.field}
              placeholder="電話"
              fullWidth
              variant="outlined"
              onChange={event =>
                handleChange({
                  key: 'cellphone',
                  value: idx(event, _ => _.target.value),
                })
              }
              disabled={openSNSCode}
            />
            {openSNSCode ? (
              <TextField
                type="number"
                value={values.code}
                css={styles.field}
                placeholder="驗證碼"
                fullWidth
                variant="outlined"
                onChange={event =>
                  handleChange({
                    key: 'code',
                    value: idx(event, _ => _.target.value),
                  })
                }
                onWheel={() => document.activeElement.blur()}
              />
            ) : (
              ''
            )}
          </CardContent>
          <CardActions>
            <ThemeProvider theme={theme}>
              <Button type="submit" variant="contained" color="primary">
                {!openSNSCode ? '獲取驗證碼' : '登入'}
              </Button>
            </ThemeProvider>
          </CardActions>
        </Card>
      </form>
    </Page>
  )
}
