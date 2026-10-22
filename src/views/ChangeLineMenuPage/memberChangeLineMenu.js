import React, { useEffect } from 'react'
import { gql, isApolloError, useMutation } from '@apollo/client'
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
          if (!window.liff.isLoggedIn()) {
            // 尚未登入：導向 LINE 登入。LIFF v2 的 login() 不回傳 Promise（原本接 .then 會拋 TypeError），
            // 登入後 LINE 會重新開啟本頁，再走下面已登入的流程
            window.liff.login()
            return undefined
          }
          return window.liff.getProfile().then(async profile => {
            await changeLineMenu({
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
        })
        .catch(err => {
          // 原本 LINE 初始化失敗沒有 catch、取個人資料失敗提示後又把錯誤拋出（都是沒人接的 rejection）；
          // GraphQL／網路錯誤已由 init-apollo 的 errorLink 提示，不重複提示
          if (!isApolloError(err)) openSnackbar({ message: `內部錯誤:${err.message}`, variant: 'error' })
        })
    }
    LIFFLogin()
  }, [])

  return (
    <Page className="min-w-[275px] p-8 mt-6" title="員工切換選單">
      <Card className="min-w-[275px] p-8 mt-6">Loading...</Card>
    </Page>
  )
}

export default React.memo(Reservation)
