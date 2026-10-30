import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { memo, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import DeductionResults from './DeductionResults'
import idx from 'idx'

function Deduction({ className, deduction }) {
  // 直接讀查詢結果：刪除後 refetch 不會改變 loading，存在 state 裡的清單不會更新；查詢失敗時當成沒有資料
  const deductionData = idx(deduction, _ => _.data.getDeductionSettings) || []
  return (
    <Fragment>
      <Card>
        <CardHeader
          action={
            <Button asChild variant="secondary" size="sm">
              <RouterLink to={'/deduction-setting'} data-testid="parameter">
                新增
              </RouterLink>
            </Button>
          }
        >
          <CardTitle>抽成方式設定</CardTitle>
        </CardHeader>
        <CardContent>
          {!deduction.loading ? <DeductionResults deduction={deduction} deductionData={deductionData} /> : <Skeleton className="h-24 w-full" />}
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(Deduction)
