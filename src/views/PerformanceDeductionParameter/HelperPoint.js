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
import HelperPointResults from './HelperPointResults'
import idx from 'idx'
import styles from './styles/HelperPoint'

function HelperPoint({ className, merchantPointValueSettings }) {
  const [merchantPointValueData, setMerchantPointValueData] = useState([])
  useEffect(() => {
    if (!merchantPointValueSettings.loading) {
      setMerchantPointValueData(idx(merchantPointValueSettings.data, _ => _.getMerchantPointValueSettings))
    }
  }, [merchantPointValueSettings.loading])
  
  return (
    <Fragment>
      <Card css={className}>
        <CardHeader 
          title="互助點數設定" 
          action={
            <Button
              color="primary"
              variant="contained"
              component={RouterLink}
              to={'/helper-point-setting-create'}
              data-testid="parameter"
            >
              新增
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {!merchantPointValueSettings.loading ? (
            <HelperPointResults
              className={styles.results}
              merchantPointValueSettings={merchantPointValueSettings}
              merchantPointValueData={merchantPointValueData}
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

export default memo(HelperPoint)