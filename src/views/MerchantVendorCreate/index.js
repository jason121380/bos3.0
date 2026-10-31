import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchGetVendor from 'hooks/useFetchGetVendor'
import useFetchSetCreateMerchantVendor from 'hooks/useFetchSetCreateMerchantVendor'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutMerchantVendor from 'views/MerchantVendorShared/AboutMerchantVendor'

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
    remark: '',
  })

  useEffect(() => {
    if (!vendorList.loading) {
      const option = idx(vendorList, _ => _.data.getVendor)
      setVendorOption(option)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [vendorList.loading])

  const handleSubmitData = () => {
    setIsClick(true)
    if (submitData.vendorUUId === null) {
      openSnackbar({
        message: '請選擇廠商',
        variant: 'warning',
      })
      setIsClick(false)
      return
    } else if (submitData.no === '') {
      openSnackbar({
        message: '請輸入代號',
        variant: 'warning',
      })
      setIsClick(false)
      return
    } else {
      const inputValue = cloneDeep(submitData)
      inputValue.vendorUUId = submitData.vendorUUId.uuid
      createMerchantVendor({
        input: inputValue,
      })
        .then(res => {
          if (res.data.createMerchantVendor) {
            openSnackbar({
              message: '新增成功',
              variant: 'success',
            })
            history.push('/merchant-vendor')
          } else {
            openSnackbar({
              message: '新增失敗',
              variant: 'error',
            })
            setIsClick(false)
          }
        })
        .catch(error => {
          setIsClick(false)
        })
    }
  }

  return (
    <Page className="ui-root" title="新增廠商">
      <div className="max-w-3xl">
        <PageHeader title="新增廠商" />
        <AboutMerchantVendor
          className="mt-6"
          vendorOption={vendorOption}
          isLoading={vendorList.loading}
          submitData={submitData}
          setSubmitData={setSubmitData}
        />
        <div className="flex justify-end pt-6">
          <Button disabled={vendorList.loading || isClick} onClick={handleSubmitData} variant="primary">
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default MerchantVendorCreate
