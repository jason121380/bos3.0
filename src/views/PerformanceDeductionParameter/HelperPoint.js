import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { memo, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import HelperPointResults from './HelperPointResults'
import idx from 'idx'

function HelperPoint({ className, merchantPointValueSettings }) {
  // 直接讀查詢結果：刪除後 refetch 不會改變 loading，存在 state 裡的清單不會更新；查詢失敗時當成沒有資料
  const merchantPointValueData = idx(merchantPointValueSettings.data, _ => _.getMerchantPointValueSettings) || []

  return (
    <Fragment>
      <Card>
        <CardHeader
          action={
            <Button asChild variant="secondary" size="sm">
              <RouterLink
                to={'/helper-point-setting-create'}
                data-testid="parameter"
              >
                新增
              </RouterLink>
            </Button>
          }
        >
          <CardTitle>互助點數設定</CardTitle>
        </CardHeader>
        <CardContent>
          {!merchantPointValueSettings.loading ? (
            <HelperPointResults
              merchantPointValueSettings={merchantPointValueSettings}
              merchantPointValueData={merchantPointValueData}
            />
            ) : (
            <Skeleton className="h-24 w-full" />
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(HelperPoint)