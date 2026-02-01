/** @jsxImportSource @emotion/react */
import { Grid } from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import useFetchMerchantDesigner from 'hooks/useFetchMerchantDesigner'
import useFetchUserGeneral from 'hooks/useFetchUserGeneral'
import useFetchSetUserDisplaySituation from 'hooks/useFetchSetUserDisplaySituation'
import idx from 'idx'
import produce from 'immer'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Redirect } from 'react-router-dom'
import useFetchSetUserBookingLimit from 'hooks/useFetchSettingUserBookingLimit'
import _ from 'lodash'

import ProfileDetails from './ProfileDetails'
import GeneralSettings from './GeneralSettings'

function General({ itemAuthority, designerId, setNameInHeader, ...rest }) {
  const { fetchUpdateUserGeneral } = useFetchUserGeneral()
  const { setUserDisplaySituation } = useFetchSetUserDisplaySituation()
  const { setUserBookingLimit } = useFetchSetUserBookingLimit()
  const designerDetail = useFetchMerchantDesigner({ designerId })

  const history = useHistory()
  const [designer, setDesigner] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    cellphone: '',
    contactAddress: '',
    address: '',
    serialNumber: '',
    birthday: 0,
    gender: '',
    nickName: '',
    designerNo: '',
    remark: '',
    avatar: '',
    // isStaff: false,
    // notDesigner: false,
    insuranceGrade: 0,
    insuranceDeductible: 0,
    bankCode: '',
    bankName: '',
    bankBranchName: '',
    bankAccount: '',
    familyMemberName: '',
    familyMemberRelation: '',
    familyMemberPhone: '',
    familyMemberAddress: '',
    isBookingAutoAccept: 'BYSTORE',
    isRTCO: false,
    selfIntroduction: null,
    selfIntroductionLink: null,
    employmentStartDate: null
  })
  const [avatar, setAvatar] = useState('')
  const [identity, setIdentity] = useState('')
  const [lineAccountId, setLineAccountId] = useState('')
  const [isLineBinded, setIsLineBinded] = useState(false)
  const [userMerchantIdentity, setUserMerchantIdentity] = useState({
    designerId: '',
    merchantIdentity: '',
  })
  // 打勾的設定
  const [userDisplaySituationState, setUserDisplaySituationState] = useState({
    designerId: '',
    isDisplayOnBookingList: false,
    isDisplayOnServiceList: false,
    isDisplayOnPerformanceList: false,
    isDisplayOnSalaryReportList: false,
    isDisplayOnClockInReportList: false,
    isDisplayOnBookingRecord: false
  })

  const [increaseSecondContent, setIncreaseSecondContent] = useState({
    increaseItems: [{ itemName: '', price: 0, type: 'INCREASE' }],
  })

  const [profitSharing, setProfitSharing] = useState({
    userId: '',
    MerchantJobTitlePointId: '',
    deductionWay: '系統預設',
  })

  const [bookingLimitInput, setBookingLimitInput] = useState({
    designerId: '',
    bookingLimit: 0,
  })

  useEffect(() => {
    if (!designerDetail.loading) {
      setBookingLimitInput({
        designerId: designerDetail.data.merchantDesigner.id,
        bookingLimit: designerDetail.data.merchantDesigner.bookingLimit,
      })
      setAvatar(designerDetail.data.merchantDesigner.avatar)
      setIdentity(designerDetail.data.merchantDesigner.identity)
      setLineAccountId(designerDetail.data.merchantDesigner.lineAccountId)
      setIsLineBinded(designerDetail.data.merchantDesigner.isLineBinded)
      setNameInHeader(
        designerDetail.data.merchantDesigner.lastName +
          designerDetail.data.merchantDesigner.firstName
      )
      setDesigner(
        produce(draft => {
          draft.userId = designerDetail.data.merchantDesigner.id
          draft.firstName = designerDetail.data.merchantDesigner.firstName
          draft.lastName = designerDetail.data.merchantDesigner.lastName
          draft.email = designerDetail.data.merchantDesigner.email
          draft.cellphone = designerDetail.data.merchantDesigner.cellphone
          draft.contactAddress = designerDetail.data.merchantDesigner.contactAddress
          draft.address = designerDetail.data.merchantDesigner.address
          draft.serialNumber = designerDetail.data.merchantDesigner.serialNumber
          draft.birthday = designerDetail.data.merchantDesigner.birthday
          draft.gender = designerDetail.data.merchantDesigner.gender
          draft.nickName = designerDetail.data.merchantDesigner.nickName
          draft.status =
            designerDetail.data.merchantDesigner.status === 'pending'
              ? 'ok'
              : designerDetail.data.merchantDesigner.status
          draft.designerNo = designerDetail.data.merchantDesigner.designerNo
          // draft.notDesigner = designerDetail.data.merchantDesigner.notDesigner
          draft.remark = designerDetail.data.merchantDesigner.remark
          draft.avatar = designerDetail.data.merchantDesigner.avatar
          // draft.isStaff = designerDetail.data.merchantDesigner.isStaff
          draft.insuranceGrade = designerDetail.data.merchantDesigner.insuranceGrade
          draft.insuranceDeductible = designerDetail.data.merchantDesigner.insuranceDeductible
          draft.bankCode = designerDetail.data.merchantDesigner.bankCode
          draft.bankName = designerDetail.data.merchantDesigner.bankName
          draft.bankBranchName = designerDetail.data.merchantDesigner.bankBranchName
          draft.bankAccount = designerDetail.data.merchantDesigner.bankAccount
          draft.familyMemberName = designerDetail.data.merchantDesigner.familyMemberName
          draft.familyMemberRelation = designerDetail.data.merchantDesigner.familyMemberRelation
          draft.familyMemberPhone = designerDetail.data.merchantDesigner.familyMemberPhone
          draft.familyMemberAddress = designerDetail.data.merchantDesigner.familyMemberAddress
          draft.isBookingAutoAccept = designerDetail.data.merchantDesigner.isBookingAutoAccept
          draft.isRTCO = designerDetail.data.merchantDesigner.isRTCO
          draft.selfIntroduction = designerDetail.data.merchantDesigner.selfIntroduction
          draft.selfIntroductionLink = designerDetail.data.merchantDesigner.selfIntroductionLink
          draft.employmentStartDate = designerDetail.data.merchantDesigner.employmentStartDate
        })
      )
      setUserMerchantIdentity({
        designerId: designerDetail.data.merchantDesigner.id,
        merchantIdentity: designerDetail.data.merchantDesigner.merchantIdentity,
      })
      // 打勾的設定
      setUserDisplaySituationState({
        designerId: designerDetail.data.merchantDesigner.id,
        isDisplayOnBookingList: designerDetail.data.merchantDesigner.isDisplayOnBookingList,
        isDisplayOnServiceList: designerDetail.data.merchantDesigner.isDisplayOnServiceList,
        isDisplayOnBookingRecord: designerDetail.data.merchantDesigner.isDisplayOnBookingRecord,
        isDisplayOnPerformanceList: designerDetail.data.merchantDesigner.isDisplayOnPerformanceList,
        // 薪資出現
        isDisplayOnSalaryReportList:
          designerDetail.data.merchantDesigner.isDisplayOnSalaryReportList,
        // 打卡出現
        isDisplayOnClockInReportList:
          designerDetail.data.merchantDesigner.isDisplayOnClockInReportList,
      })
    }
  }, [designerDetail.data, designerDetail.loading])
  const handleFieldChange = ({ value, key }) => {
    setDesigner(
      produce(draft => {
        draft[key] = value
      })
    )
  }
  const handleEmployeeResign = () => {
    openSnackbar({
      message: '確定要離職此員工？',
      variant: 'error',
      disableHide: true,
      resign: true,
      designerId,
    })
  }
  const handleSubmit = () => {
    const userId = JSON.parse(localStorage.getItem('user')).id
    const newDesigner = _.cloneDeep(designer)
    delete newDesigner.avatar
    if (newDesigner.cellphone.trim().length < 7) {
      openSnackbar({ message: '手機長度必須大於六碼', variant: 'warning' })
    } else {
      fetchUpdateUserGeneral(newDesigner)
        .then(() => {
          if (newDesigner.status === 'banned' && designerId === userId) {
            openSnackbar({ message: '已將此帳號設為停用', variant: 'error' })
            const timeout = setTimeout(() => {
              localStorage.clear()
              history.push('/auth/login')
              clearTimeout(timeout)
            }, 150)
          } else {
            setUserBookingLimit({ input: bookingLimitInput }).then(() => {
              openSnackbar({ message: '儲存成功', variant: 'success' })
            })
            setUserDisplaySituation({ input: userDisplaySituationState }).then(() => {
              designerDetail.refetch()
              openSnackbar({
                message: '儲存成功',
                variant: 'success',
              })
              history.push('/management/employee')
            })
          }
        })
        .catch(err => openSnackbar({ message: err.message, variant: 'error' }))
    }
    
  }

  const handleBookingLimit = ({ key, value }) => {
    setBookingLimitInput(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleSalesWayChange = ({ key, value }) => {
    setProfitSharing(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  return (
    <Grid {...rest} container spacing={3}>
      {idx(designerDetail.data, _ =>
        _.merchantDesigner ? (
          <React.Fragment>
            <Grid item lg={4} md={6} xl={3} xs={12}>
              <ProfileDetails
                profile={designer}
                onChange={handleFieldChange}
                avatar={avatar}
                identity={identity}
                lineAccountId={lineAccountId}
                isLineBinded={isLineBinded}
                merchantIdentity={_.merchantDesigner.merchantIdentity}
                userDisplaySituationState={userDisplaySituationState}
                setUserDisplaySituationState={setUserDisplaySituationState}
                bookingLimitInput={bookingLimitInput}
                handleBookingLimit={handleBookingLimit}
                profitSharing={profitSharing}
                handleSalesWayChange={handleSalesWayChange}
                setProfitSharing={setProfitSharing}
                merchantDesigner={_.merchantDesigner}
                itemAuthority={itemAuthority}
              />
            </Grid>
            <Grid item lg={8} md={6} xl={9} xs={12}>
              <GeneralSettings
                profile={designer}
                onChange={handleFieldChange}
                onEmployeeResign={handleEmployeeResign}
                onSubmit={handleSubmit}
              />
            </Grid>
          </React.Fragment>
        ) : (
          <Redirect to="/management/employee" />
        )
      )}
    </Grid>
  )
}

export default General
