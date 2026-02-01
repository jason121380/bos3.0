/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import Card from '@mui/material/Card'
import Page from 'components/Page'
import getQueryString from 'helper/getQueryString'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  }),
  card: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  }),
  field: css({
    width: '100%',
    marginBottom: theme.spacing(2),
  }),
}

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
              console.log(a)
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
                  console.log(a)
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
    <Page css={styles.root} title="切換選單">
      <Card css={styles.card}>Loading</Card>
    </Page>
  )
}

export default React.memo(Reservation)
