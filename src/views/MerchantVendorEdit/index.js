/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchGetVendor, { useFetchGetMerchantVendor } from 'hooks/useFetchGetVendor'
import useFetchSetUpdateMerchantVendor from 'hooks/useFetchSetUpdateMerchantVendor'
import idx from 'idx'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutMerchantVendorEdit from './AboutMerchantVendorEdit'

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

function MerchantVendorEdit({ match }) {
  const history = useHistory()
  const vendorList = useFetchGetVendor()
  const merchantVendor = useFetchGetMerchantVendor({ input: match.params.id })
  const { updateMerchantVendor } = useFetchSetUpdateMerchantVendor()

  const [vendorOption, setVendorOption] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [submitData, setSubmitData] = useState({
    uuid: null,
    no: '',
    name: '',
    nickname: '',
    remark: '',
    vendorUUId: '',
  })

  useEffect(() => {
    if (!merchantVendor.loading && !vendorList.loading) {
      const option = idx(vendorList, _ => _.data.getVendor)
      const data = idx(merchantVendor, _ => _.data.getMerchantVendor)
      const vendorUUId = option.find(d => d.uuid === data.vendor.uuid)
      setVendorOption(option)
      setSubmitData({
        uuid: data.uuid,
        no: data.no,
        name: data.name,
        nickname: data.nickname,
        remark: data.remark,
        vendorUUId: vendorUUId,
      })
    }
  }, [merchantVendor.loading, vendorList.loading])
  const handleUpdateData = () => {
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
      updateMerchantVendor({
        input: inputValue
      }).then(res => {
        if (res.data.updateMerchantVendor) {
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
    <Page css={styles.root} title="編輯廠商">
      <Container maxWidth="md">
        <PageTitle title='編輯廠商' subTitle='MERCHANT VENDOR EDIT' />
        <AboutMerchantVendorEdit
          className={styles.aboutPayment}
          vendorOption={vendorOption}
          isLodaing={vendorList.loading}
          submitData={submitData}
          setSubmitData={setSubmitData}
        />
        <div css={styles.actions}>
          <Button disabled={vendorList.loading || isClick} onClick={handleUpdateData} color="primary" variant="contained">
            儲存
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default MerchantVendorEdit
