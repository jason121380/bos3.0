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
import cloneDeep from 'lodash/cloneDeep'
import { Card, CardContent } from 'ui/card'

import ProfileDetails from './ProfileDetails'
import GeneralSettings from './GeneralSettings'
import MobileBookingSettings from './MobileBookingSettings'
import PermissionSettings from './PermissionSettings'

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
    jobTitle: '',
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
    employmentStartDate: null,
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
    isDisplayOnBookingRecord: false,
  })

  const [increaseSecondContent, setIncreaseSecondContent] = useState({
    increaseItems: [{ itemName: '', price: 0, type: 'INCREASE' }],
  })

  const [bookingLimitInput, setBookingLimitInput] = useState({
    designerId: '',
    bookingLimit: 0,
  })

  useEffect(() => {
    // 查無此員工（merchantDesigner 為 null）時不帶入，由下方 Redirect 導回員工列表（Jason 2026/10/22）
    if (!designerDetail.loading && idx(designerDetail, _ => _.data.merchantDesigner)) {
      setBookingLimitInput({
        designerId: designerDetail.data.merchantDesigner.id,
        bookingLimit: designerDetail.data.merchantDesigner.bookingLimit,
      })
      setAvatar(designerDetail.data.merchantDesigner.avatar)
      setIdentity(designerDetail.data.merchantDesigner.identity)
      setLineAccountId(designerDetail.data.merchantDesigner.lineAccountId)
      setIsLineBinded(designerDetail.data.merchantDesigner.isLineBinded)
      setNameInHeader(designerDetail.data.merchantDesigner.firstName + ' ' + designerDetail.data.merchantDesigner.lastName)
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
          draft.jobTitle = designerDetail.data.merchantDesigner.jobTitle
          draft.status = designerDetail.data.merchantDesigner.status === 'pending' ? 'ok' : designerDetail.data.merchantDesigner.status
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
        isDisplayOnSalaryReportList: designerDetail.data.merchantDesigner.isDisplayOnSalaryReportList,
        // 打卡出現
        isDisplayOnClockInReportList: designerDetail.data.merchantDesigner.isDisplayOnClockInReportList,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [designerDetail.data, designerDetail.loading, setNameInHeader])
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
    const newDesigner = cloneDeep(designer)
    delete newDesigner.avatar
    delete newDesigner.jobTitle // jobTitle 只用於顯示，不傳送給後端
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

  return (
    <div {...rest} className="flex flex-col gap-6">
      {idx(designerDetail.data, _ =>
        _.merchantDesigner ? (
          <React.Fragment>
            <div>
              <ProfileDetails
                profile={designer}
                avatar={avatar}
                isLineBinded={isLineBinded}
                merchantIdentity={_.merchantDesigner.merchantIdentity}
                onEmployeeResign={handleEmployeeResign}
                onSubmit={handleSubmit}
              />
            </div>
            {/* 權限設置與手機端預約設定 */}
            <div>
              <Card>
                <CardContent>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                      <PermissionSettings
                        userDisplaySituationState={userDisplaySituationState}
                        setUserDisplaySituationState={setUserDisplaySituationState}
                      />
                    </div>
                    <div>
                      <MobileBookingSettings
                        profile={designer}
                        onChange={handleFieldChange}
                        bookingLimitInput={bookingLimitInput}
                        handleBookingLimit={handleBookingLimit}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* 基本資料表單 */}
            <div>
              <GeneralSettings profile={designer} onChange={handleFieldChange} onEmployeeResign={handleEmployeeResign} onSubmit={handleSubmit} />
            </div>
          </React.Fragment>
        ) : (
          <Redirect to="/management/employee" />
        )
      )}
    </div>
  )
}

export default General
