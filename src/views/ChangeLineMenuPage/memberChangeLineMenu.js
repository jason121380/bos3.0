import React, { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { Card } from 'ui/card'
import { openSnackbar } from 'elements/snackbars'
import Page from 'components/Page'
import getQueryString from 'helper/getQueryString'

const ChangeLineMenu = gql`
  mutation ChangeLineMenu($input: MemberChangeLineMenuInput!) {
    memberChangeLineMenu(input: $input)
  }
`

function Reservation({ match, location }) {
  const menuId = getQueryString({ key: 'menuId', location })
  const liffId = getQueryString({ key: 'liffId', location })
  const storeId = getQueryString({ key: 'storeId', location })

  const [changeLineMenu] = useMutation(ChangeLineMenu)

  useEffect(() => {
    if (liffId.length !== 0) {
      localStorage.setItem('liffId', liffId)
    } else {
      // 原本 setItem('liffId', null) 會存成字串 "null"，登入頁以 !== null 判斷就誤走 LINE 登入、不存 token
      localStorage.removeItem('liffId')
    }
    const LIFFLogin = () => {
      window.liff
        .init({
          liffId: liffId,
        })
        .then(() => {
          if (window.liff.isLoggedIn()) {
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
                window.liff.closeWindow()
              })
              .catch(err => {
                openSnackbar({ message: `內部錯誤:${err.message}`, variant: 'error' })
                throw new Error(`${err.code}: ${err.message}`)
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
                  window.liff.closeWindow()
                })
                .catch(err => {
                  openSnackbar({ message: `內部錯誤:${err.message}`, variant: 'error' })
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
    <Page className="min-w-[275px] p-8 mt-6" title="員工切換選單">
      <Card className="min-w-[275px] p-8 mt-6">載入中…</Card>
    </Page>
  )
}

export default React.memo(Reservation)
