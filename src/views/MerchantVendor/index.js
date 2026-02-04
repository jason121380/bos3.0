/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

const localStyles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3)
  }),
}

function MerchantVendor() {
  const merchantVendorList = useFetchGetMerchantVendorList()
  const [merchantVendor, setMerchantVendor] = useState([])

  useEffect(() => {
    if (!merchantVendorList.loading) {
      const data = idx(merchantVendorList, _ => _.data.getMerchantVendorList)
      setMerchantVendor(data)
    }
  }, [merchantVendorList.loading])

  return (
    <Page css={localStyles.root} title="廠商列表">
      <Container maxWidth={false} css={localStyles.container}>
        <AdminPageHeader
          title="廠商列表"
          primaryAction={{
            label: '新增廠商',
            to: '/merchant-vendor/create'
          }}
        />
        {!merchantVendorList.loading ? (
          <Results
            merchantVendor={merchantVendor}
            merchantVendorList={merchantVendorList}
          />
        ) : (
          <div style={{ textAlign: 'center', marginTop: '200px' }}>
            <CircularProgress />
          </div>
        )}

      </Container>
    </Page>
  )
}

export default MerchantVendor
