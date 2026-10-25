import Page from 'components/Page'
import idx from 'idx'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import { useFetchProfileIdentity } from 'hooks/useFetchProfile'
import { getApiEnvironment, getGraphqlUrl } from 'lib/api-base'
import { APP_VERSION } from '../../version'
import {
  EXECUTIVE_AUTHORITY_NAME,
  buildEngineeringChecks,
  engineeringRouteDecision,
  graphqlHostname,
  isEngineeringUnlocked,
  isExecutiveAuthority,
  readMerchantSummary,
  readStorageKeyPresence,
  readStoredUserName,
  tryUnlockEngineering,
} from 'helper/engineeringMode'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import { TextField } from 'ui/text-field'
import { cn, focusRing } from 'ui/utils'

const CHIP = {
  pass: { variant: 'success', label: 'PASS' },
  fail: { variant: 'danger', label: 'FAIL' },
  pending: { variant: 'warning', label: '檢查中' },
}

const StatusChip = ({ status }) => {
  const chip = CHIP[status] || CHIP.fail
  return <Badge variant={chip.variant}>{chip.label}</Badge>
}

const graphqlStatusOf = identity => {
  if (identity.error) return 'fail'
  if (idx(identity, _ => _.data.me.id)) return 'pass'
  if (identity.loading) return 'pending'
  return 'fail'
}

function EngineeringMode() {
  const history = useHistory()
  const identity = useFetchProfileIdentity()
  const authorityName = idx(identity, _ => _.data.me.merchantIdentity.authorityName) || ''
  const [roleConfirmed, setRoleConfirmed] = useState(false)
  const [password, setPassword] = useState('')
  const [gateError, setGateError] = useState('')
  const [unlocked, setUnlocked] = useState(() => isEngineeringUnlocked())

  useEffect(() => {
    if (isExecutiveAuthority(authorityName)) setRoleConfirmed(true)
  }, [authorityName])

  const decision = engineeringRouteDecision({
    loading: identity.loading,
    authorityName,
    unlocked,
    roleConfirmed,
  })

  useEffect(() => {
    if (decision === 'deny') history.push('/profile/general')
  }, [decision, history])

  const onSubmit = event => {
    event.preventDefault()
    if (tryUnlockEngineering(password)) {
      setPassword('')
      setGateError('')
      setUnlocked(true)
      return
    }
    setGateError('密碼不正確')
  }

  const recheck = () => {
    if (typeof identity.refetch === 'function') {
      identity.refetch().catch(() => {
        // errorLink 已提示；這裡只避免未處理的拒絕
      })
    }
  }

  if (decision === 'deny') return null

  if (decision === 'loading') {
    return (
      <Page className="ui-root" title="工程模式">
        <PageHeader title="工程模式" description="正在確認角色" />
        <div className="flex max-w-3xl flex-col gap-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </Page>
    )
  }

  if (decision === 'gate') {
    return (
      <Page className="ui-root" title="工程模式">
        <PageHeader title="工程模式" description="高階主管專用。解鎖後只在這個分頁保持，登出後需重新輸入。" />
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>工程密碼</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <TextField
                label="工程密碼"
                type="password"
                name="engineering-password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value)
                  if (gateError) setGateError('')
                }}
                error={Boolean(gateError)}
                helperText={gateError || '密碼錯誤時不會顯示系統狀態'}
                autoComplete="off"
                fullWidth
              />
              <div>
                <Button type="submit" variant="primary">
                  進入
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Page>
    )
  }

  const merchant = readMerchantSummary(localStorage.getItem('userMerchant'))
  const checks = buildEngineeringChecks({
    appVersion: APP_VERSION,
    nodeEnv: process.env.NODE_ENV,
    apiEnvironment: getApiEnvironment(),
    apiHostname: graphqlHostname(getGraphqlUrl()),
    graphqlStatus: graphqlStatusOf(identity),
    merchant,
    roleName: authorityName || (roleConfirmed ? EXECUTIVE_AUTHORITY_NAME : ''),
    userName: readStoredUserName(localStorage.getItem('user')),
    storage: readStorageKeyPresence(localStorage),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    viewport: typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : null,
  })

  return (
    <Page className="ui-root" title="工程模式">
      <PageHeader
        title="工程模式"
        description="前端看得到的版號、環境與連線狀態。不顯示權杖或密碼。"
        actions={
          <Button type="button" variant="secondary" onClick={recheck} disabled={identity.loading}>
            重新檢查
          </Button>
        }
      />
      <div className="flex max-w-3xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>檢查結果</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {checks.map(check => (
              <div
                key={check.id}
                data-testid={`engineering-check-${check.id}`}
                data-status={check.status}
                className="flex flex-wrap items-start justify-between gap-3 border-0 border-b border-solid border-border pb-4 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-label font-medium text-text">{check.label}</p>
                  <p className="mt-1 break-all text-body text-text-secondary">{check.detail}</p>
                </div>
                <StatusChip status={check.status} />
              </div>
            ))}
          </CardContent>
        </Card>
        <p className="text-body text-text-secondary">
          版號與側欄左上角相同。站內相關頁面：
          <RouterLink to="/system-update-record" className={cn('ml-1 text-accent underline', focusRing)}>
            版本更新紀錄
          </RouterLink>
        </p>
      </div>
    </Page>
  )
}

export default EngineeringMode
