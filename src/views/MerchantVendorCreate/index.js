/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchGetVendor from 'hooks/useFetchGetVendor'
import useFetchSetCreateMerchantVendor from 'hooks/useFetchSetCreateMerchantVendor'
import idx from 'idx'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutMerchantVendorCreate from './AboutMerchantVendorCreate'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

function MerchantVendorCreate() {
  const history = useHistory()
  const vendorList = useFetchGetVendor()
  const { createMerchantVendor } = useFetchSetCreateMerchantVendor()
  const [vendorOption, setVendorOption] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [submitData, setSubmitData] = useState({
    vendorUUId: null,
    no: '',
    name: '',
    nickname: '',
    remark: ''
  })

  useEffect(() => {
    if (!vendorList.loading) {
      const option = idx(vendorList, _ => _.data.getVendor)
      setVendorOption(option)
    }
  }, [vendorList.loading])

  const handleSubmitData = () => {
    setIsClick(true)
    if (submitData.vendorUUId === null) {
      openSnackbar({
        message: '請選擇廠商',
        variant: 'warning'
      })
      setIsClick(false)
      return
    } else if (submitData.no === '') {
      openSnackbar({
        message: '請輸入代號',
        variant: 'warning'
      })
      setIsClick(false)
      return
    } else {
      const inputValue = _.cloneDeep(submitData)
      inputValue.vendorUUId = submitData.vendorUUId.uuid
      createMerchantVendor({
        input: inputValue
      }).then(res => {
        if (res.data.createMerchantVendor) {
          openSnackbar({
            message: '新增成功',
            variant: 'success'
          })
          history.push('/merchant-vendor')
        } else {
          openSnackbar({
            message: '新增失敗',
            variant: 'error'
          })
          setIsClick(false)
        }
      }).catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error'
        })
        setIsClick(false)
      })
    }
  }

  return (
    <Page css={styles.root} title="新增廠商">
      <Container maxWidth="md">
        <PageTitle title='新增廠商' subTitle='MERCHANT VENDOR CREATE' />
        <AboutMerchantVendorCreate
          className={styles.aboutPayment}
          vendorOption={vendorOption}
          isLodaing={vendorList.loading}
          submitData={submitData}
          setSubmitData={setSubmitData}
        />
        <div css={styles.actions}>
          <Button disabled={vendorList.loading || isClick} onClick={handleSubmitData} color="primary" variant="contained">
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default MerchantVendorCreate
