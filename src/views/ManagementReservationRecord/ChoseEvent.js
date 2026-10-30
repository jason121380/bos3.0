import { useState, useEffect } from 'react'
// 外層為 ui/dialog（OrderTable；窗內有 MobileDatePicker、Autocomplete、PasswordDialog（ui/dialog））；內容區、動作列與按鈕改原生元素＋ui/button
import { openSnackbar } from 'elements/snackbars'
import { getMinutes, startOfDay, addMinutes } from 'date-fns'
import useFetchAdminBookingTime from 'hooks/useFetchAdminBookingTime'
import useFetchBooking from 'hooks/useFetchBooking'
import useFetchVerifyBooking from 'hooks/useFetchVerifyBooking'
import useFetchUpdateOrder from 'hooks/useFetchUpdateOrder'
import useFetchNonDesignationBooking from 'hooks/useFetchNonDesignationBooking'
import useFetchNonDesignateBookingLimit from 'hooks/useFetchMerchantDesignateTimeNonDesignateBookingLimit'
import useFetchSettingMerchantNonDesignateBookingLimit from 'hooks/useFetchSetMerchantDesignateTimeNonDesignateBookingLimit'
import useFetchSetBookingCheckin from 'hooks/useFetchSetBookingCheckin'
import useFetchSetBookingCancelCheckin from 'hooks/useFetchSetBookingCancelCheckin'
import useFetchSetDelayBookingCheckinTime from 'hooks/useFetchSetDelayBookingCheckinTime'
import useFetchSetBookingCusCheckRequired from 'hooks/useFetchSetBookingCusCheckRequired'
import useFetchSetBookingNoShow from 'hooks/useFetchSetBookingNoShow'
import PasswordDialog from 'components/PasswordDialog'
import idx from 'idx'
import { green, grey, blue } from 'ui/colors'
import produce from 'immer'
import { timeCostArray } from './choseEventConstants'
import { NewBookingSection, NdsBookingSection } from './ChoseEventBookingSections'
import { EditOrderSection } from './ChoseEventEditOrderSection'
import { EditOrderDetailSection } from './ChoseEventEditOrderDetailSection'
import { EventSection, DelayMessageSection } from './ChoseEventInfoSections'

// 各 modaltype 的畫面區塊已拆到同資料夾 ChoseEvent*Section(s).js（只接 props）；hooks、state、effect、handler 仍在此檔，內容不變
export default function ChoseEvent({
  merchantId, setModalOpen, clickData, refetchData, modaltype, setModalType,
  editOrder, setEditOrder, checkinSettings, bookingCusCheck, checkinMode,
  cancelPasswordUsing
}) {
  const { booking } = useFetchBooking()
  const { updateOrder } = useFetchUpdateOrder()
  const { adminBookingTime } = useFetchAdminBookingTime()
  const { verifyBooking } = useFetchVerifyBooking()
  const { nonDesignationBooking } = useFetchNonDesignationBooking()
  const { setMerchantNonDesignateBookingLimit } = useFetchSettingMerchantNonDesignateBookingLimit()
  const { setDelayBookingCheckinTime } = useFetchSetDelayBookingCheckinTime()
  const { setBookingCusCheckRequired } = useFetchSetBookingCusCheckRequired()
  const { setBookingNoShow } = useFetchSetBookingNoShow()
  const nonDesignateLimitData = useFetchNonDesignateBookingLimit({
    date: clickData.dateTime,
  })
  const { setBookingCheckin } = useFetchSetBookingCheckin()
  const { setBookingCancelCheckin } = useFetchSetBookingCancelCheckin()
  const [bookTimeOption, setBookTimeOption] = useState([])
  const [btnDisabled, setBtnDisabled] = useState(false)
  const [orderLimit, setOrderLimit] = useState(true)
  const [limitCount, setLimitCount] = useState({
    date: null,
    limit: 0,
  })
  const [delayTime, setDelayTime] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (editOrder.date) {
      const start = startOfDay(editOrder.date).getTime()
      const arr = []
      for (let i = 0; i < 48; i++) {
        arr.push(addMinutes(start, i * 30).getTime())
      }
      setBookTimeOption(arr)
    }
  }, [editOrder])

  const [values, setValues] = useState({
    merchantId: merchantId,
    dateTime: clickData.dateTime,
    designerId: clickData.designerId,
    name: '',
    cellphone: '',
    friends: [],
    designerServiceIds: [],
    remark: '',
    remarkForCustomer: '',
    timeCost: 1,
    isBookingCostUsing: true,
    isCusCheckRequired: false
  })
  useEffect(() => {
    if (!nonDesignateLimitData.loading) {
      const nonDesignateLimit = idx(
        nonDesignateLimitData,
        _ => _.data.merchantDesignateTimeNonDesignateBookingLimit
      )
      if (nonDesignateLimit !== null) {
        setLimitCount(nonDesignateLimit)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [nonDesignateLimitData.loading])

  const closeOrderTime = () => {
    setBtnDisabled(true)
    adminBookingTime({
      appointable: modaltype === 'openOrder' ? true : false,
      datetime: clickData.dateTime,
      designerId: clickData.designerId,
    })
      .then(res => {
        if (res.data.adminBookingTime.designerId) {
          refetchData()
          openSnackbar({ message: '變更成功', variant: 'success' })
          setModalOpen(false)
        }
      })
      .catch(error => {
        // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
        setBtnDisabled(false)
      })
  }

  const createBooking = () => {
    if (values.cellphone === '') {
      openSnackbar({
        message: '請填寫電話',
        variant: 'warning',
      })
      return
    }
    if (values.name === '') {
      openSnackbar({
        message: '請填寫顧客',
        variant: 'warning',
      })
      return
    }
    setBtnDisabled(true)
    booking(values).then((res) => {
      if (res.data.bookingV2.id) {
        refetchData()
        openSnackbar({ message: '預約成功', variant: 'success' })
        setModalOpen(false)
      }
    }).catch(error => {
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
      setBtnDisabled(false)
    })
  }

  const handleAcceptBooking = status => {
    setBtnDisabled(true)
    verifyBooking({
      orderId: editOrder.id,
      isApproval: status,
      isFromPC: true,
      password
    }).then(res => {
      if (res.data.verifyBooking.id) {
        refetchData()
        if (status) {
          openSnackbar({
            message: '已接受預約',
            variant: 'success',
          })
        } else {
          openSnackbar({
            message: '已取消預約',
            variant: 'success',
          })
          setDialogOpen(false)
        }
        setModalOpen(false)
      }
    }).catch(error => {
      setBtnDisabled(false)
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
    })
  }

  const handleUpdateEditOrder = () => {
    if (getMinutes(new Date(editOrder.date)) !== 0 && getMinutes(new Date(editOrder.date)) !== 30) {
      openSnackbar({
        message: '時間有誤',
        variant: 'warning',
      })
      return
    } else {

      if (!editOrder.customer.id) {
        openSnackbar({
          message: '請選擇顧客',
          variant: 'warning',
        })
        return
      }

      if (editOrder.designer && !editOrder.designer.id) {
        openSnackbar({
          message: '請選擇服務人員',
          variant: 'warning',
        })
        return
      }

      if (modaltype === 'editNdsOrder' && editOrder.isDesignate && (!editOrder.designer || !editOrder.designer.id)) {
        openSnackbar({
          message: '請選擇服務人員',
          variant: 'warning',
        })
        return
      }
      const submitData = {
        orderInput: {
          customerId: editOrder.customer.id,
          date: editOrder.date,
          designerId: editOrder.designer ? editOrder.designer.id : null,
          isDesignate: editOrder.isDesignate,
          remark: editOrder.remark,
          remarkForCustomer: editOrder.remarkForCustomer,
          timeCost: editOrder.timeCost,
          isBookingCostUsing: editOrder.isBookingCostUsing
        },
        notificationDayCount: editOrder.notificationDayCount,
        updateOrderId: editOrder.id,
      }

      setBtnDisabled(true)
      updateOrder(submitData).then(res => {
        if (res.data.updateOrder.id) {
          refetchData()
          openSnackbar({
            message: '帳單編輯成功',
            variant: 'success',
          })
          setModalOpen(false)
        }
      }).catch(error => {
        setBtnDisabled(false)
        // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
      })
    }
  }

  const updateLimitCount = () => {
    // 人數清空時 parseInt('') 為 NaN，一併擋下（Jason 2026/10/22 fix all）
    if (!Number.isInteger(limitCount.limit) || limitCount.limit < 0) {
      openSnackbar({
        message: '預約人數有誤',
        variant: 'warning',
      })
      return
    }
    setBtnDisabled(true)
    setMerchantNonDesignateBookingLimit({ input: limitCount }).then(res => {
      if (res.data.setMerchantDesignateTimeNonDesignateBookingLimit.merchant) {
        openSnackbar({ message: '設定完成', variant: 'success' })
        setModalOpen(false)
      } else {
        openSnackbar({ message: '設定失敗', variant: 'error' })
        setBtnDisabled(false)
      }
    }).catch(error => {
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
      setBtnDisabled(false)
    })

  }

  const createNdsBooking = () => {
    if (values.cellphone === '') {
      openSnackbar({
        message: '請填寫電話',
        variant: 'warning',
      })
      return
    }
    if (values.name === '') {
      openSnackbar({
        message: '請填寫顧客',
        variant: 'warning',
      })
      return
    }

    const submitData = {
      bookingDate: values.dateTime,
      cellphone: values.cellphone,
      customerName: values.name,
      storeId: merchantId,
      remark: values.remark,
      remarkForCustomer: values.remarkForCustomer,
      timeCost: values.timeCost,
      isCusCheckRequired: values.isCusCheckRequired
    }
    if (limitCount.limit === 0) {
      openSnackbar({ message: '此時段可預約人數設定為0', variant: 'warning' })
    } else {
      setBtnDisabled(true)
      nonDesignationBooking(submitData).then(res => {
        if (res.data.nonDesignationBooking.id) {
          openSnackbar({ message: '預約成功', variant: 'success' })
          setModalOpen(false)
          refetchData()
        }
      }).catch(error => {
        setBtnDisabled(false)
        // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
      })
    }
  }

  const handleSetBookingCusCheckRequired = async checked => {
    setBtnDisabled(true)
    try {
      const res = await setBookingCusCheckRequired({
        input: {
          bookingId: editOrder.id,
          isRequired: checked
        }
      })
      if (res) {
        setEditOrder(
          produce(draft => {
            draft.isCusCheckRequired = checked
          })
        )
        openSnackbar({ message: '編輯成功', variant: 'success' })
        refetchData()
      }
    } catch (error) {
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
    } finally {
      setBtnDisabled(false)
    }
  }

  const findTimeCost = timeCost => {
    const findData = timeCostArray.find(data => data.value === timeCost)
    return findData ? findData.label : ''
  }

  const handleCheckIn = async () => {
    setBtnDisabled(true) 
    try {
      await setBookingCheckin({
        bookingId: editOrder.id,
        isCellphone: false
      })
      openSnackbar({ message: '報到成功', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false)
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
    }
  }
  
  const handleCancelCheckIn = async () => {
    setBtnDisabled(true) 
    try {
      await setBookingCancelCheckin({
        bookingId: editOrder.id,
        isCellphone: false
      })
      openSnackbar({ message: '已取消報到', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false)
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
    }
  }

  const handleSetDelayBookingTime = async () => {
    setBtnDisabled(true) 
    try {
      await setDelayBookingCheckinTime({
        input: {
          bookingId: editOrder.id,
          delayTime: delayTime,
        }
      })
      openSnackbar({ message: '簡訊已寄出', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false) 
    }
  }

  const handleSetBookingNoShow = async () => {
    setBtnDisabled(true) 
    try {
      await setBookingNoShow({
        input: {
          bookingIds: [editOrder.id],
          isNoShow: !editOrder.isNoShow,
        }
      })
      openSnackbar({ message: '設定成功', variant: 'success' })
      setModalOpen(false)
      refetchData()
    } catch (error) {
      setBtnDisabled(false) 
    }
  }

  const openPassworDialog = () => {
    setDialogOpen(true)
  }
  const closePassworDialog = () => {
    setDialogOpen(false)
    setPassword('')
  }

  return (
    <div className="flex-auto overflow-y-auto px-6 py-4">
      {(modaltype === 'default' || modaltype === 'openOrder') && (
        <NewBookingSection
          setModalOpen={setModalOpen}
          modaltype={modaltype}
          bookingCusCheck={bookingCusCheck}
          checkinMode={checkinMode}
          btnDisabled={btnDisabled}
          values={values}
          setValues={setValues}
          closeOrderTime={closeOrderTime}
          createBooking={createBooking}
        />
      )}

      {modaltype === 'editOrder' && (
        <EditOrderSection
          setModalOpen={setModalOpen}
          setModalType={setModalType}
          editOrder={editOrder}
          checkinSettings={checkinSettings}
          bookingCusCheck={bookingCusCheck}
          cancelPasswordUsing={cancelPasswordUsing}
          btnDisabled={btnDisabled}
          handleAcceptBooking={handleAcceptBooking}
          handleSetBookingCusCheckRequired={handleSetBookingCusCheckRequired}
          handleCheckIn={handleCheckIn}
          handleCancelCheckIn={handleCancelCheckIn}
          handleSetBookingNoShow={handleSetBookingNoShow}
          openPassworDialog={openPassworDialog}
        />
      )}
      {(modaltype === 'editOrderDetail' || modaltype === "editNdsOrder") && (
        <EditOrderDetailSection
          setModalOpen={setModalOpen}
          modaltype={modaltype}
          editOrder={editOrder}
          setEditOrder={setEditOrder}
          checkinSettings={checkinSettings}
          bookingCusCheck={bookingCusCheck}
          bookTimeOption={bookTimeOption}
          btnDisabled={btnDisabled}
          handleUpdateEditOrder={handleUpdateEditOrder}
          handleSetBookingCusCheckRequired={handleSetBookingCusCheckRequired}
          handleCheckIn={handleCheckIn}
          handleCancelCheckIn={handleCancelCheckIn}
        />
      )}

      {modaltype === 'ndsDefault' && (
        <NdsBookingSection
          setModalOpen={setModalOpen}
          clickData={clickData}
          bookingCusCheck={bookingCusCheck}
          btnDisabled={btnDisabled}
          orderLimit={orderLimit}
          setOrderLimit={setOrderLimit}
          limitCount={limitCount}
          setLimitCount={setLimitCount}
          values={values}
          setValues={setValues}
          updateLimitCount={updateLimitCount}
          createNdsBooking={createNdsBooking}
        />
      )}

      {(modaltype === 'event') && (
        <EventSection
          setModalOpen={setModalOpen}
          editOrder={editOrder}
          findTimeCost={findTimeCost}
        />
      )}
      {(modaltype === 'message') && (
        <DelayMessageSection
          setModalOpen={setModalOpen}
          btnDisabled={btnDisabled}
          delayTime={delayTime}
          setDelayTime={setDelayTime}
          handleSetDelayBookingTime={handleSetDelayBookingTime}
        />
      )}
      <PasswordDialog
        open={dialogOpen}
        title='取消預約'
        inputLabel='取消預約密碼'
        handleOnCancel={closePassworDialog}
        handleOnConfirm={() => handleAcceptBooking(false)}
        isLoading={btnDisabled}
        inputOnChange={value => setPassword(value)}
      />
    </div>
  )
}
