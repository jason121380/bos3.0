/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Card, CardContent, CardHeader, TextField, Grid, Alert,
  Container, Divider, Button, CircularProgress, Snackbar
} from '@mui/material'
import Page from 'components/Page'
import { useParams } from 'react-router'
import produce from 'immer'
import { cloneDeep } from 'lodash'
import useFetchCheckIsCustomerExistForOuterStore from 'hooks/useFetchCheckIsCustomerExistForOuterStore'
import useFetchGetMerchantName from 'hooks/useFetchGetMerchantName'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '& input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
      'WebkitBoxShadow': '0 0 0 60px #ffffff inset !important',
      'backgroundColor': '#fafafa !important',
      'backgroundClip': 'content-box !important'
    },
    '& .MuiOutlinedInput-input': {
      padding: '12px !important'
    },
    '& .MuiCardContent-root': {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    },
    '& .MuiCardContent-root, input, .MuiFormControlLabel-label': {
      fontSize: 16,
    },
    '& .MuiCardHeader-title': {
      fontSize: 20
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3f51b5'
    },
    '& .MuiAlert-message': {
      fontSize: 16
    },
    '& .MuiOutlinedInput-input:-webkit-autofill': {
      caretColor: '#000',
      'WebkitTextFillColor': '#000'
    }
  }),
  label: css({
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    '& span': {
      color: 'red'
    }
  })
}

const index = () => {
  const { id } = useParams()
  const [checkExist, checkExistData] = useFetchCheckIsCustomerExistForOuterStore()
  const getMerchantName = useFetchGetMerchantName({ input: id })
  const [openSnack, setOpenSnack] = useState({
    open: false,
    severity: '',
    message: ''
  })
  const [data, setData] = useState({
    name: '',
    cellphone: '',
    count: 1,
    merchantName: '',
    isExist: false
  })
  const [isClick, setIsClick] = useState(false)

  const handleSetInputValue = (value, key) => {
    setData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const closeSnackBar = () => {
    if (openSnack.message === '資料建立中請稍候') return
    setOpenSnack(
      produce(draft => {
        draft.open = false
      })
    )
  }

  const restPage = () => {
    setData({
      name: '',
      cellphone: '',
      count: 1,
      merchantName: '測試店家',
      isExist: false
    })
  }

  const handleSubmit = async () => {
    setIsClick(true)
    const { name, cellphone, count } = cloneDeep(data)
    try {
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'warning',
            draft.message = '資料建立中請稍候'
        })
      )
      if (!cellphone.match(/^[0-9]{5,20}$/)) throw new Error('電話格式有誤: 請輸入5-20碼的數字。')
      if (!count) throw new Error('張數為必填欄位')
      if (count > 500) throw new Error('單次發券張數不可超過500張')
      if (!name.trim()) throw new Error('姓名欄位為必填。')
      let url = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app/outer_store/send_event_ticket'
      if (window.location.href.indexOf('app.beautyos.co') === -1) {
        url = 'http://localhost:4849/outer_store/send_event_ticket'
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name, cellphone, count,
          merchantId: id
        }),
      })
      if (res.status === 400) {
        const message = await res.json()
        throw new Error(message)
      } else {
        restPage()
        setOpenSnack(
          produce(draft => {
            draft.open = true,
              draft.severity = 'success',
              draft.message = '發券成功'
          })
        )
      }
    } catch (error) {
      setIsClick(false)
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'error',
            draft.message = error.message
        })
      )
    } finally {
      setIsClick(false)
    }
  }

  useEffect(() => {
    if (!checkExistData.loading && checkExistData.data) {
      const { customerName, isExist } = checkExistData.data.checkIsCustomerExistForOuterStore
      setData(
        produce(draft => {
          draft.isExist = isExist
          if (!isExist) return
          draft.name = customerName || ''
        })
      )
    }
  }, [checkExistData.loading])

  useEffect(() => {
    if (!getMerchantName.loading) {
      const data = getMerchantName.data.getMerchantName
      handleSetInputValue(data, 'merchantName')
    }
  }, [getMerchantName.loading])

  return (
    <Page css={styles.root} title={`${data.merchantName}  抽獎資格登錄`}>
      <Container maxWidth='md'>
        <Card>
          <CardHeader title={`${data.merchantName}  抽獎資格登錄`} />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                電話<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.cellphone}
                  fullWidth
                  variant="outlined"
                  type="tel"
                  onBlur={() => {
                    checkExist({
                      variables: {
                        input: {
                          cellphone: data.cellphone,
                          storeId: id
                        }
                      }
                    })
                  }}
                  onChange={e => {
                    if (e.target.value.match(/^[0-9]+$/) || e.target.value === '') {
                      handleSetInputValue(e.target.value, 'cellphone')
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                張數<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.count}
                  placeholder='張數範圍1~500'
                  fullWidth
                  variant="outlined"
                  type="tel"
                  onChange={e => {
                    if (e.target.value.match(/^[0-9]+$/) || e.target.value === '') {
                      handleSetInputValue(parseInt(e.target.value) ? parseInt(e.target.value) : '', 'count')
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                姓名<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  disabled={data.isExist || checkExistData.loading}
                  value={data.name}
                  fullWidth
                  variant="outlined"
                  inputProps={{ maxLength: 20 }}
                  onChange={e => handleSetInputValue(e.target.value, 'name')}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <ThemeProvider theme={theme}>
          <Button
            style={{ marginTop: 20, width: '100%', fontSize: 16, minHeight: 40 }}
            disabled={checkExistData.loading || !data.name.trim()}
            color='primary'
            variant='contained'
            onClick={handleSubmit}
          >{isClick ? <CircularProgress style={{ color: 'white' }} size={22} /> : '提交'}</Button>
        </ThemeProvider>
      </Container>
      <Snackbar
        onClose={closeSnackBar}
        open={openSnack.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert elevation={6} severity={openSnack.severity} variant="filled">{openSnack.message}</Alert>
      </Snackbar>
    </Page>
  )
}

export default index