import React, { /* useRef, */ useState, useEffect, Fragment } from 'react'
import Page from 'components/Page'
import { useParams, useLocation } from 'react-router'
import produce from 'immer'
import useFetchCustomerSelfCreate from 'hooks/useFetchCustomerSelfCreate'
import useFetchGetIsCustomerSelfCreateActive from 'hooks/useFetchGetIsCustomerSelfCreateActive'
import useFetchGetMerchantName from 'hooks/useFetchGetMerchantName'
import cloneDeep from 'lodash/cloneDeep'

import General from './General'
import Status from './Status'

const index = () => {
  const { id } = useParams()
  const { search } = useLocation()
  const designerId = new URLSearchParams(search).get('designerId')
  // const reCaptchaRef = useRef(null)
  const { setCustomerCreate } = useFetchCustomerSelfCreate()
  const getMerchantName = useFetchGetMerchantName({ input: id })
  const customerSelfCreateActive = useFetchGetIsCustomerSelfCreateActive({ input: id })
  const [openSnack, setOpenSnack] = useState({
    open: false,
    severity: '',
    message: ''
  })
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

  const closeSnackBar = () => {
    if (openSnack.message === '資料建立中請稍候') return
    setOpenSnack(
      produce(draft => {
        draft.open = false
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
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'warning',
            draft.message = '姓名、電話不得為空'
        })
      )
      // resetRecaptcha()
      setIsClick(false)
      return
    }

    if (designerId) {
      submitData.designerId = designerId
    }

    try {
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'warning',
            draft.message = '資料建立中請稍候'
        })
      )
      const res = await setCustomerCreate(submitData)
      if (res.data.customerSelfCreateV2) {
        setOpenSnack(
          produce(draft => {
            draft.open = true,
              draft.severity = 'success',
              draft.message = '建立成功'
          })
        )
        setIsSuccess(true)
      } else {
        throw new Error('建立失敗')
      }
    } catch (error) {
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'error',
            draft.message = error.message
        })
      )
      // resetRecaptcha()
    } finally {
      setIsClick(false)
    }
  }

  useEffect(() => {
    if (!customerSelfCreateActive.loading) {
      const data = customerSelfCreateActive.data.getIsCustomerSelfCreateActive
      setPageEnable(data)
    }
  }, [customerSelfCreateActive.loading])

  useEffect(() => {
    if (!getMerchantName.loading) {
      const data = getMerchantName.data.getMerchantName
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
            closeSnackBar={closeSnackBar}
            openSnack={openSnack}
            // reCaptchaRef={reCaptchaRef}
            handleSubmit={handleSubmit}
          />
        </Page>
      )}
    </Fragment>
  )
}

export default index