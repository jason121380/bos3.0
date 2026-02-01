/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  CircularProgress
} from '@mui/material'
import { memo, Fragment, useState, useEffect } from 'react'
import _ from 'lodash'
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
      <Card css={className}>
        <CardHeader 
          title="抽成方式設定" 
          action={
            <Button
              color="primary"
              variant="contained"
              component={RouterLink}
              to={'/deduction-setting'}
              data-testid="parameter"
            >
              新增
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {!deductionData.loading ? (
            <DeductionResults
              deduction={deduction}
              deductionData={deductionData}
            />
            ) : (
            <div style={{ textAlign: 'center' }}>
              <CircularProgress />
            </div>
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(Deduction)
