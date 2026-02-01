/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import React from 'react'
import { useHistory } from 'react-router'
import useFetchSetCreateNewAuthority from 'hooks/useFetchSetCreateNewAuthority'
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

function AuthorityCreate() {
  const { createNewAuthority } = useFetchSetCreateNewAuthority()

  const history = useHistory()

  const [roleName, setRoleName] = React.useState('')
  const handleSubmit = () => {
    createNewAuthority({ input: roleName }).then(() => {
      history.push('/authority')
      openSnackbar({ message: '新增成功', variant: 'success' })
    })
  }
  const vaild = !roleName.length > 0

  return (
    <Page css={styles.root} title="新增角色">
      <Container maxWidth="lg">
        <PageTitle title='新增角色' subTitle='Create Role' />
        <AboutAuthority
          className={styles.aboutPayment}
          roleName={roleName}
          setRoleName={setRoleName}
        />
        <div css={styles.actions}>
          <Button color="primary" variant="contained" disabled={vaild} onClick={handleSubmit}>
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default AuthorityCreate
