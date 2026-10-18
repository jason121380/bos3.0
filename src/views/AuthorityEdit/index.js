import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchUpdateAuthority from 'hooks/useFetchUpdateAuthority'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'

import AboutAuthority from './AboutAuthority'

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
    <Page className="ui-root" title="編輯角色">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader className="pb-0" title="編輯角色" />
        {userAuthorityName !== null && authoritySettings.length > 0 && (
          <AboutAuthority
            userAuthorityName={userAuthorityName}
            setUserAuthorityName={setUserAuthorityName}
            authoritySettings={authoritySettings}
            setAuthoritySettings={setAuthoritySettings}
          />
        )}
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSubmit}>
            儲存
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default AuthorityCreate
