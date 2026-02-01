/** @jsxImportSource @emotion/react */
import { useRef, useState, useEffect } from 'react'
import {
  Card, CardContent, CardHeader, TextField, Grid,
  Container, Divider, Button, CircularProgress,
  Snackbar, Alert
} from '@mui/material'
import Page from 'components/Page'
import ReCAPTCHA from "react-google-recaptcha-enterprise"
import useFetchGetCustomerCheckTicket from 'hooks/useFetchGetCustomerCheckTicket'
import produce from 'immer'
import { cloneDeep } from 'lodash'
import idx from 'idx'
import EventTicketsRecord from './EventTicketsRecord'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    '& input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
      'WebkitBoxShadow': '0 0 0 60px #fafafa inset !important',
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
  const [getCustomerTicket, customerTicketData] = useFetchGetCustomerCheckTicket()
  const reCaptchaRef = useRef(null)
  const [openSnack, setOpenSnack] = useState({
    open: false,
    severity: '',
    message: ''
  })
  const [submitData, setSubmitData] = useState({
    name: '',
    cellphone: '',
    recaptchaToken: null
  })
  const [data, setData] = useState({
    message: '',
    customerEventTickets: []
  })

  const handleSetInputValue = (value, key) => {
    setSubmitData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleSearchData = async () => {
    const { name, cellphone, recaptchaToken } = cloneDeep(submitData)
    try {
      if (/* !name.trim() ||  */!cellphone.trim()) {
        setOpenSnack(
          produce(draft => {
            draft.open = true,
              draft.severity = 'warning',
              draft.message = '電話不得為空'
          })
        )
      } else {
        getCustomerTicket({
          variables: {
            input: {
              // name,
              cellphone,
              recaptchaToken
            }
          }
        })
      }
    } catch (error) {
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'error',
            draft.message = error.message
        })
      )
      reCaptchaRef.current && reCaptchaRef.current.reset()
    }
  }

  const closeSnackBar = () => {
    setOpenSnack(
      produce(draft => {
        draft.open = false
      })
    )
  }

  useEffect(() => {
    if (!customerTicketData.loading && customerTicketData.data) {
      const data = idx(customerTicketData, _ => _.data.customerCheckTicket)
      setData(data)
      reCaptchaRef.current && reCaptchaRef.current.reset()
      setSubmitData(
        produce(draft => {
          draft.recaptchaToken = null
        })
      )
    }
  }, [customerTicketData.loading])

  return (
    <Page css={styles.root} title="抽獎券查詢">
      <Container maxWidth='md'>
        <Card>
          <CardHeader title='抽獎券查詢' />
          <Divider />
          <CardContent>
            {/* <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                姓名<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={submitData.name}
                  fullWidth
                  variant="outlined"
                  onChange={e => handleSetInputValue(e.target.value, 'name')}
                />
              </Grid>
            </Grid> */}
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                電話<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={submitData.cellphone}
                  fullWidth
                  variant="outlined"
                  onChange={e => handleSetInputValue(`${e.target.value}`, 'cellphone')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <ReCAPTCHA
                sitekey='6Ld-aOIoAAAAAGbZQp0OxepSjatcmlUIxPuJA8uq'
                onChange={v => handleSetInputValue(v, 'recaptchaToken')}
                ref={reCaptchaRef}
                type='image'
              />
            </Grid>
          </CardContent>
        </Card>
        <ThemeProvider theme={theme}>
          <Button
            style={{ marginTop: 20, width: '100%', fontSize: 16, minHeight: 40 }}
            disabled={!submitData.recaptchaToken || customerTicketData.loading}
            color='primary'
            variant='contained'
            onClick={handleSearchData}
          >{customerTicketData.loading ? <CircularProgress style={{ color: 'white' }} size={22} /> : '提交'}</Button>
        </ThemeProvider>
        {!customerTicketData.loading && customerTicketData.data && (
          <EventTicketsRecord data={data} />
        )}
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