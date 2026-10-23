import { openSnackbar } from 'elements/snackbars'
import React, { /* useRef, */ useState, useEffect, Fragment } from 'react'
import idx from 'idx'
import Page from 'components/Page'
import { useParams, useLocation } from 'react-router'
import produce from 'immer'
import useFetchCustomerSelfCreate from 'hooks/useFetchCustomerSelfCreate'
import useFetchGetIsCustomerSelfCreateActive from 'hooks/useFetchGetIsCustomerSelfCreateActive'
import useFetchGetMerchantName from 'hooks/useFetchGetMerchantName'
import cloneDeep from 'lodash/cloneDeep'

import General from './General'
import Status from './Status'

const CustomerSelfCreate = () => {
  const { id } = useParams()
  const { search } = useLocation()
  const designerId = new URLSearchParams(search).get('designerId')
  // const reCaptchaRef = useRef(null)
  const { setCustomerCreate } = useFetchCustomerSelfCreate()
  const getMerchantName = useFetchGetMerchantName({ input: id })
  const customerSelfCreateActive = useFetchGetIsCustomerSelfCreateActive({ input: id })
  const [data, setData] = useState({
    name: '',
    cellphone: '',
    nickName: '',
    gender: 'MALE',
    email: '',
    lineId: '',
    birthday: null,
    address: '',
    merchantName: '',
    recaptchaToken: true
  })
  const [isClick, setIsClick] = useState(false)
  const [pageEnable, setPageEnable] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSetInputValue = (value, key) => {
    setData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  // const resetRecaptcha = () => {
  //   reCaptchaRef.current && reCaptchaRef.current.reset()
  //     setData(
  //       produce(draft => {
  //         draft.recaptchaToken = null
  //       })
  //     )
  // }

  const handleSubmit = async () => {
    setIsClick(true)
    const { merchantName, recaptchaToken, ...submitData } = { ...cloneDeep(data), merchantId: id }
    if (!submitData.name.trim() || !submitData.cellphone.trim()) {
      openSnackbar({ message: '姓名、電話不得為空', variant: 'warning' })
      // resetRecaptcha()
      setIsClick(false)
      return
    }

    if (designerId) {
      submitData.designerId = designerId
    }

    try {
      openSnackbar({ message: '資料建立中請稍候', variant: 'warning' })
      const res = await setCustomerCreate(submitData)
      if (res.data.customerSelfCreateV2) {
        openSnackbar({ message: '建立成功', variant: 'success' })
        setIsSuccess(true)
      } else {
        throw new Error('建立失敗')
      }
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
      // resetRecaptcha()
    } finally {
      setIsClick(false)
    }
  }

  useEffect(() => {
    if (!customerSelfCreateActive.loading) {
      // 查詢失敗時視為未開放（原本 data 為 undefined 時整頁錯誤；Jason 2026/10/22 fix all）
      const data = Boolean(idx(customerSelfCreateActive, _ => _.data.getIsCustomerSelfCreateActive))
      setPageEnable(data)
    }
  }, [customerSelfCreateActive.loading])

  useEffect(() => {
    if (!getMerchantName.loading) {
      // 查詢失敗時店名留空（原本 data 為 undefined 時整頁錯誤；Jason 2026/10/22 fix all）
      const data = idx(getMerchantName, _ => _.data.getMerchantName) || ''
      handleSetInputValue(data, 'merchantName')
    }
  }, [getMerchantName.loading])

  return (
    <Fragment>
      {!customerSelfCreateActive.loading && !pageEnable ? (
        <Status />
      ) : isSuccess ? <Status isSuccess /> : (
        <Page className="ui-root" title={`${data.merchantName}  顧客資料建立`}>
          <General
            data={data}
            handleSetInputValue={handleSetInputValue}
            isClick={isClick}
            // reCaptchaRef={reCaptchaRef}
            handleSubmit={handleSubmit}
          />
        </Page>
      )}
    </Fragment>
  )
}

export default CustomerSelfCreate