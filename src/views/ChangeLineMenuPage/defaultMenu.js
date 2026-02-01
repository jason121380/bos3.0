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
              console.log(a)
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
    <Page css={styles.root} title="切回預設選單">
      <Card css={styles.card}>Loading</Card>
    </Page>
  )
}

export default React.memo(Reservation)
