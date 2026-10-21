import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { memo, Fragment, useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import DeductionResults from './DeductionResults'
import idx from 'idx'

function Deduction({ className, deduction }) {
  const [deductionData, setDeductionData] = useState([])
  useEffect(() => {
    if(!deduction.loading) {
      setDeductionData(idx(deduction, _ => _.data.getDeductionSettings))
    }
  }, [deduction.loading])
  return (
    <Fragment>
      <Card>
        <CardHeader
          action={
            <Button asChild variant="secondary" size="sm">
              <RouterLink
                to={'/deduction-setting'}
                data-testid="parameter"
              >
                新增
              </RouterLink>
            </Button>
          }
        >
          <CardTitle>抽成方式設定</CardTitle>
        </CardHeader>
        <CardContent>
          {!deductionData.loading ? (
            <DeductionResults
              deduction={deduction}
              deductionData={deductionData}
            />
            ) : (
            <Skeleton className="h-24 w-full" />
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(Deduction)
