import { useFetchGetMerchantPointValueSettingsForEdit } from 'hooks/useFetchGetMerchantPointValueSettings'
import useFetchUpdateMerchantPointValueSetting from 'hooks/useFetchUpdateMerchantPointValueSetting'
import { openSnackbar } from 'elements/snackbars'
import Page from 'components/Page'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import { useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import idx from 'idx'

import Results from './Results'

function HelperPointSettingEdit({ match }) {
  const history = useHistory()
  const settingId = match.params.id
  const getMerchantPointValueSettingsForEdit = useFetchGetMerchantPointValueSettingsForEdit(settingId)
  const { updateMerchantPointValueSetting } = useFetchUpdateMerchantPointValueSetting()
  const [isclick, setIsClick] = useState(false)
  const [submitData, setSubmitData] = useState({
    name: '',
    paidFixed: 0,
    retrieveFixed: 0,
    retrievePointWay: 'FIXED',
    NONSEGMENTED: [{ threshold: 0, price: 0 }],
    SEGMENTED: [{ threshold: 0, price: 0 }],
    isAccordingToHelper: false
  })

  useEffect(() => {
    if (!getMerchantPointValueSettingsForEdit.loading) {
      const data = idx(getMerchantPointValueSettingsForEdit, _ => _.data.getMerchantPointValueSetting)
      // 查詢失敗或查無設定時不帶入（原本讀 undefined.name 整頁進入錯誤畫面）
      if (!data) return
      const newSubmitData = cloneDeep(submitData)
      newSubmitData.name = data.name
      newSubmitData.paidFixed = data.paidFixed
      newSubmitData.retrieveFixed = data.retrieveFixed
      newSubmitData.retrievePointWay = data.retrievePointWay
      newSubmitData.isAccordingToHelper = data.isAccordingToHelper
      if (newSubmitData[data.retrievePointWay]) newSubmitData[data.retrievePointWay] = data.retrieveSegmentSetting
      setSubmitData(newSubmitData)
    }
  }, [getMerchantPointValueSettingsForEdit.loading])

  const handleUpdate = () => {
    // 名稱必填（Jason 2026/10/22「照建議」）
    if (!String(submitData.name || '').trim()) {
      openSnackbar({ variant: 'warning', message: '請輸入互助點數設定名稱' })
      return
    }
    setIsClick(true)
    const data = {
      name: submitData.name,
      paidFixed: submitData.paidFixed,
      retrievePointWay: submitData.retrievePointWay,
      isAccordingToHelper: submitData.isAccordingToHelper
    }
    if (data.retrievePointWay === 'FIXED') {
      data.retrieveFixed = submitData.retrieveFixed
    } else {
      data.retrieveSegmentSetting = submitData[data.retrievePointWay]
    }
    const inputValue = {
      updateSettingId: settingId,
      updateSettingData: data,
    }
    updateMerchantPointValueSetting(inputValue).then(res => {
      if (res.data.updateMerchantPointValueSetting) {
        openSnackbar({
          variant: 'success',
          message: '儲存成功',
        })
        history.push('/performanceDeductionParameter')
      } else {
        openSnackbar({
          variant: 'warning',
          message: '儲存失敗',
        })
        setIsClick(false)
      }
    }).catch(error => {
      openSnackbar({
        variant: 'error',
        message: error.message,
      })
      setIsClick(false)
    })
  }
  return (
    <Page className="ui-root" title="編輯互助點數設定">
      <div>
        <PageHeader
          title="編輯互助點數設定"
          actions={
            <Button disabled={isclick} onClick={handleUpdate} variant="primary">
              儲存
            </Button>
          }
        />
        {!getMerchantPointValueSettingsForEdit.loading ?
          <Results
            status={submitData.retrievePointWay}
            submitData={submitData}
            setSubmitData={setSubmitData}
          /> : (
            // 載入中：與舊版 CircularProgress 相同時機顯示
            <div aria-busy="true" aria-label="載入中">
              <Skeleton className="h-[360px] w-full max-w-3xl rounded-lg" />
            </div>
          )}
      </div>
    </Page>
  )
}

export default HelperPointSettingEdit
