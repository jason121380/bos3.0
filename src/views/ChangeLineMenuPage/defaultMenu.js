import React, { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Card } from 'ui/card'
import Page from 'components/Page'
import getQueryString from 'helper/getQueryString'

const SetDefaultLineMenu = gql`
  mutation SetDefaultLineMenu($input: SetDefaultLineMenuInput!) {
    setDefaultLineMenu(input: $input)
  }
`

function Reservation({ match, location }) {
  const liffId = getQueryString({ key: 'liffId', location })
  const storeId = getQueryString({ key: 'storeId', location })

  const [setDefaultLineMenu] = useMutation(SetDefaultLineMenu)


  useEffect(() => {
    const LIFFLogin = () => {
      window.liff
        .init({
          liffId: liffId,
        })
        .then(() => {
          if (window.liff.isLoggedIn()) {
            window.liff.getProfile().then(async profile => {
              const a = await setDefaultLineMenu({
                variables: {
                  input: {
                    lineId: profile.userId,
                    storeId: storeId,
                  },
                },
              })
              window.liff.closeWindow()
            })
          } else {
            window.liff.login().then(() => {
              window.liff
                .getProfile()
                .then(async profile => {
                  const a = await setDefaultLineMenu({
                    variables: {
                      input: {
                        lineId: profile.userId,
                        storeId: storeId,
                      },
                    },
                  })
                  // setLoading(false)
                  window.liff.closeWindow()
                })
                .catch(err => {
                  throw new Error(`${err.code}: ${err.message}`)
                })
            })
          }
        })
    }
    LIFFLogin()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在掛載時執行一次
  }, [])

  return (
    <Page className="min-w-[275px] p-8 mt-6" title="切回預設選單">
      <Card className="min-w-[275px] p-8 mt-6">Loading</Card>
    </Page>
  )
}

export default React.memo(Reservation)
