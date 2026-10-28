import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchUpdateAuthority from 'hooks/useFetchUpdateAuthority'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'

import AboutAuthority from './AboutAuthority'
import QueryFailed from 'components/QueryFailed'

function AuthorityCreate({ match }) {
  const { updateAuthority } = useFetchUpdateAuthority()
  const merchantAuthData = useFetchMerchantAuthorities()
  const history = useHistory()

  const [userAuthorityName, setUserAuthorityName] = useState(null)

  const [authoritySettings, setAuthoritySettings] = useState([])
  // 網址的角色 id 不在角色清單（角色已被刪除、網址打錯）時顯示找不到角色（Jason 2026/10/22；原本讀 undefined 整頁錯誤）
  const [notFound, setNotFound] = useState(false)
  useEffect(() => {
    if (!merchantAuthData.loading) {
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities) || []
      const userAuth = merchantAuth.filter(data => data.id === match.params.id)

      if (userAuth.length === 0) {
        // 查詢失敗時 errorLink 已提示，這裡只在查詢成功但找不到時顯示
        setNotFound(merchantAuthData.data !== undefined)
        return
      }
      setNotFound(false)
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
        {merchantAuthData.error ? (
          <QueryFailed onRetry={() => merchantAuthData.refetch()} />
        ) : notFound ? (
          <Card>
            <EmptyState
              title="找不到這個角色"
              description="角色可能已被刪除，或網址有誤。"
              action={
                <Button variant="secondary" onClick={() => history.push('/authority')}>
                  返回角色列表
                </Button>
              }
            />
          </Card>
        ) : (
          <>
            {userAuthorityName !== null && authoritySettings.length > 0 && (
              <AboutAuthority
                userAuthorityName={userAuthorityName}
                setUserAuthorityName={setUserAuthorityName}
                authoritySettings={authoritySettings}
                setAuthoritySettings={setAuthoritySettings}
              />
            )}
            <div className="flex justify-end">
              {/* 角色讀到之前（載入中、查詢失敗）不能儲存，避免送出空名稱與空權限（Codex review PR #270 P2） */}
              <Button variant="primary" onClick={handleSubmit} disabled={userAuthorityName === null}>
                儲存
              </Button>
            </div>
          </>
        )}
      </div>
    </Page>
  )
}

export default AuthorityCreate
