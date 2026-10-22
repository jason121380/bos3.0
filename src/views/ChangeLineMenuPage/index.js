import React, { useEffect } from 'react'
import { gql, isApolloError, useMutation } from '@apollo/client'
import { Card } from 'ui/card'
import { openSnackbar } from 'elements/snackbars'
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
          // 原本沒有 catch（沒人接的 rejection，畫面停在 Loading 沒有提示）。
          // GraphQL／網路錯誤已由 init-apollo 的 errorLink 提示；LINE 初始化、取個人資料失敗在這裡提示
          if (!isApolloError(err)) openSnackbar({ message: err.message, variant: 'error' })
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
