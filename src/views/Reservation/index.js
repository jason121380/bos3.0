import Page from 'components/Page'
import { Provider } from 'context/useReservationContext'
import getQueryString from 'helper/getQueryString'
import { useFetchMerchantLiff } from 'hooks/useFetchViewer'
import produce from 'immer'
import React from 'react'

import Form from './Form'

function Reservation({ match, location }) {
  const merchantId = match.params.id
  const merchantLiff = useFetchMerchantLiff({
    merchantId: merchantId,
  })

  const [values, setValues] = React.useState({
    merchantId,
    date: getQueryString({ key: 'date', location })
    ? new Date(parseInt(getQueryString({ key: 'date', location }))).getTime()
    : new Date().getTime(),
    dateTime: getQueryString({ key: 'date', location })
    ? new Date(parseInt(getQueryString({ key: 'date', location }))).getTime()
    : '',
    reference: '',
    designerId: getQueryString({ key: 'designerId', location })
      ? getQueryString({ key: 'designerId', location })
      : '',
    customers: {
      main: {
        name: '',
        cellphone: '',
        cellphoneErr: false,
        bookingCategoryId: '',
        designerService: [],
      },
    },
  })
  React.useEffect(() => {
    if (merchantLiff.data) {
      const LIFFLogin = () => {
        window.liff
          .init({
            liffId: merchantLiff.data.viewer.anonymous.merchant.reservationLiff,
          })
          .then(() => {
            if (window.liff.isLoggedIn()) {
              window.liff.getProfile().then(profile => {
                const customer = JSON.parse(localStorage.getItem('customer'))
                setValues(
                  produce(draft => {
                    draft.customers.main.cellphone =
                      customer && customer.cellphone ? customer.cellphone : ''
                    draft.customers.main.name = customer && customer.name ? customer.name : ''
                    draft.lineId = profile.userId
                  })
                )
              })
            } else {
              window.liff.login().then(() => {
                window.liff
                  .getProfile()
                  .then(profile => {
                    setValues(
                      produce(draft => {
                        draft.lineId = profile.userId
                      })
                    )
                  })
                  .catch(err => {
                    throw new Error(`${err.code}: ${err.message}`)
                  })
              })
            }
          })
      }

      const queryString = getQueryString({ key: 'usingLineLogin', location })
      if (!queryString || queryString === '1') LIFFLogin()
    }
    return () => {
      setValues({
        merchantId,
        date: getQueryString({ key: 'date', location })
        ? new Date(parseInt(getQueryString({ key: 'date', location }))).getTime()
        : new Date().getTime(),
        dateTime: getQueryString({ key: 'date', location })
        ? new Date(parseInt(getQueryString({ key: 'date', location }))).getTime()
        : '',
        reference: '',
        designerId: getQueryString({ key: 'designerId', location })
          ? getQueryString({ key: 'designerId', location })
          : '',
        customers: {
          main: {
            name: '',
            cellphone: '',
            cellphoneErr: false,
            bookingCategoryId: '',
            designerService: [],
          },
        },
      })
    }
  }, [location, merchantLiff.data])

  return (
    <Page className="ui-root flex flex-col gap-4" title="預約服務">
      <Provider
        value={{
          values,
          setValues,
          merchantId,
          location,
        }}
      >
        <h1 className="text-title !font-bold text-text">預約服務</h1>
        <Form />
      </Provider>
    </Page>
  )
}

export default React.memo(Reservation)
