import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { memo, Fragment, useState, useEffect } from 'react'
import _ from 'lodash'
import { Link as RouterLink } from 'react-router-dom'
import HelperPointResults from './HelperPointResults'
import idx from 'idx'

function HelperPoint({ className, merchantPointValueSettings }) {
  const [merchantPointValueData, setMerchantPointValueData] = useState([])
  useEffect(() => {
    if (!merchantPointValueSettings.loading) {
      setMerchantPointValueData(idx(merchantPointValueSettings.data, _ => _.getMerchantPointValueSettings))
    }
  }, [merchantPointValueSettings.loading])
  
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