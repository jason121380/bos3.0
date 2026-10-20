import React, { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Card } from 'ui/card'
import Page from 'components/Page'
import getQueryString from 'helper/getQueryString'

const ChangeLineMenu = gql`
  mutation ChangeLineMenu($input: ChangeLineMenuInput!) {
    changeLineMenu(input: $input)
  }
`

function Reservation({ match, location }) {
  const menuId = getQueryString({ key: 'menuId', location })
  const liffId = getQueryString({ key: 'liffId', location })
  const storeId = getQueryString({ key: 'storeId', location })

  const [changeLineMenu] = useMutation(ChangeLineMenu)

  useEffect(() => {
    const LIFFLogin = () => {
      window.liff
        .init({
          liffId: liffId,
        })
        .then(() => {
          if (window.liff.isLoggedIn()) {
            window.liff.getProfile().then(async profile => {
              const a = await changeLineMenu({
                variables: {
                  input: {
                    lineId: profile.userId,
                    menuId: menuId,
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
                  const a = await changeLineMenu({
                    variables: {
                      input: {
                        lineId: profile.userId,
                        menuId: menuId,
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
  }, [])

  return (
    <Page className="min-w-[275px] p-8 mt-6" title="切換選單">
      <Card className="min-w-[275px] p-8 mt-6">Loading</Card>
    </Page>
  )
}

export default React.memo(Reservation)
