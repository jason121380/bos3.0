import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { openSnackbar } from 'elements/snackbars'
import React from 'react'
import { useHistory } from 'react-router'
import useFetchSetCreateNewAuthority from 'hooks/useFetchSetCreateNewAuthority'

import AboutAuthority from './AboutAuthority'

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
    <Page className="ui-root" title="新增角色">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader className="pb-0" title="新增角色" />
        <AboutAuthority
          roleName={roleName}
          setRoleName={setRoleName}
        />
        <div className="flex justify-end">
          <Button variant="primary" disabled={vaild} onClick={handleSubmit}>
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default AuthorityCreate
