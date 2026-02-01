/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchUpdateAuthority from 'hooks/useFetchUpdateAuthority'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutAuthority from './AboutAuthority'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

function AuthorityCreate({ match }) {
  const { updateAuthority } = useFetchUpdateAuthority()
  const merchantAuthData = useFetchMerchantAuthorities()
  const history = useHistory()

  const [userAuthorityName, setUserAuthorityName] = useState(null)

  const [authoritySettings, setAuthoritySettings] = useState([])
  useEffect(() => {
    if (!merchantAuthData.loading) {
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities)
      const userAuth = merchantAuth.filter(data => data.id === match.params.id)

      setUserAuthorityName(userAuth[0].authorityName)
      setAuthoritySettings(JSON.parse(userAuth[0].authoritySettings))
    }
  }, [merchantAuthData.loading])

  const handleSubmit = () => {
    updateAuthority({
      authorityId: match.params.id,
      settings: JSON.stringify(authoritySettings),
      authorityName: userAuthorityName,
    }).then(() => {
      merchantAuthData.refetch()
      history.push('/authority')
      openSnackbar({ message: '更新成功', variant: 'success' })
    })
  }

  return (
    <Page css={styles.root} title="編輯角色">
      <Container maxWidth="lg">
        <PageTitle title='編輯角色' subTitle='Edit Role' />
        {userAuthorityName !== null && authoritySettings.length > 0 && (
          <AboutAuthority
            className={styles.aboutPayment}
            userAuthorityName={userAuthorityName}
            setUserAuthorityName={setUserAuthorityName}
            authoritySettings={authoritySettings}
            setAuthoritySettings={setAuthoritySettings}
          />
        )}
        <div css={styles.actions}>
          <Button color="primary" variant="contained" onClick={handleSubmit}>
            儲存
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default AuthorityCreate
