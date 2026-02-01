/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Button, Grid } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import idx from 'idx'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'


import Results from './Results'
import styles from './styles/ProductCategories'

function MerchantVendor() {
  const merchantVendorList = useFetchGetMerchantVendorList()
  const [merchantVendor, setMerchantVendor] = useState([])

  useEffect(() => {
    if (!merchantVendorList.loading) {
      const data = idx(merchantVendorList,_=>_.data.getMerchantVendorList)
      setMerchantVendor(data)
    }
  }, [merchantVendorList.loading])
  
  return (
    <Page css={styles.root} title="廠商列表">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='廠商列表' subTitle='Merchant Vendor' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/merchant-vendor/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        {!merchantVendorList.loading ?
          <Results
          className={styles.results}
          merchantVendor={merchantVendor}
          merchantVendorList={merchantVendorList}
        /> : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress/></div>}
        
      </Container>
    </Page>
  )
}

export default MerchantVendor
