import { Snackbar, Alert } from 'ui/feedback-compat'
import { useRef, useState, useEffect } from 'react'
import Page from 'components/Page'
import ReCAPTCHA from "react-google-recaptcha-enterprise"
import useFetchGetCustomerCheckTicket from 'hooks/useFetchGetCustomerCheckTicket'
import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import idx from 'idx'
import { LoaderCircle } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'
import EventTicketsRecord from './EventTicketsRecord'

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
    <Page className="ui-root flex flex-col gap-4" title="抽獎券查詢">
      <h1 className="text-title !font-bold text-text">抽獎券查詢</h1>
      <Card>
        <CardContent className="flex flex-col gap-4">
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
          <Field label="電話" required htmlFor="ticket-search-cellphone">
            <Input
              id="ticket-search-cellphone"
              className="h-11"
              value={submitData.cellphone}
              onChange={e => handleSetInputValue(`${e.target.value}`, 'cellphone')}
            />
          </Field>
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey='6Ld-aOIoAAAAAGbZQp0OxepSjatcmlUIxPuJA8uq'
              onChange={v => handleSetInputValue(v, 'recaptchaToken')}
              ref={reCaptchaRef}
              type='image'
            />
          </div>
        </CardContent>
      </Card>
      <Button
        variant="primary"
        size="lg"
        className="h-11 w-full"
        disabled={!submitData.recaptchaToken || customerTicketData.loading}
        onClick={handleSearchData}
      >{customerTicketData.loading ? <LoaderCircle className="animate-spin" strokeWidth={1.75} /> : '提交'}</Button>
      {!customerTicketData.loading && customerTicketData.data && (
        <EventTicketsRecord data={data} />
      )}
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
