// 全域提示（openSnackbar）：呼叫介面與 569 個呼叫端不變，只換呈現（STYLE §6 Toast／Dialog、§9 無障礙）。
// - 純訊息（success／info／warning／error）畫成 ui/toast 的 ToastCard，放在各版面唯一的 <Toaster>（右下角）；
//   色彩全走 tokens；成功／一般提示 3 秒自動消失（滑鼠移入或聚焦時暫停），錯誤需手動關閉；error 為 role=alert，其餘 role=status（aria-live=polite）。
// - 確認型（resign／groupEdit：離職、月結、日結、鎖定加扣項、掛單、刪除系統紀錄／盤點草稿、批次編輯）改畫成 modal 對話框：
//   標題＋寫出後果的說明＋「取消／確認」兩鈕；Esc、點背景、取消都只關閉，不會觸發確認；確認鈕呼叫的 callback 與原本完全相同。
//   使用共享圖層堆疊的 ui/dialog，支援從 ui/dialog 內開啟巢狀確認。
// - 訊息槽元件（SnackbarContentWrapper）在開啟期間保持同一個實例：確認後的月結／日結進度（progress state）會接著畫在提示卡上。
// 結帳進度以 inline SVG 定值圓環＋百分比呈現。
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogBody, DialogFooter } from 'ui/dialog'
import { Button } from 'ui/button'
import { Toaster, ToastCard } from 'ui/toast'
import { LoaderCircle } from 'lucide-react'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState, forwardRef } from 'react'
import useRemoveUserFromMerchant from 'hooks/useRemoveUserFromMerchant'
import useFetchSetUserSalaryMonthlyCheckoutV2 from 'hooks/useFetchSetUserSalaryMonthlyCheckoutV2'
import useFetchUpdateUserOrderableList from 'hooks/useFetchSettingUpdateUserOrderableList'
import useFetchSettingUserSalaryItemLock from 'hooks/useFetchSetLockUserSalaryItem'
import useFetchCloseDailyAccountV3 from 'hooks/useFetchCloseDailyAccountV3'
import { useFetchCreateSystemUpdateDelete } from 'hooks/useFetchSystemUpdateRecord'
import cloneDeep from 'lodash/cloneDeep'
import { friendlyErrorMessage } from 'lib/friendly-error'

const AUTO_HIDE_MS = 3000

// 錯誤文案（只改顯示字串）：去掉 Apollo 加的「GraphQL error: 」「Network error: 」前綴（`${error}` 會多一個「Error: 」一併去掉）；
// 瀏覽器的連線失敗訊息改成看得懂的中文。錯誤／警告提示再經 lib/friendly-error：伺服器錯誤、資料格式錯誤等英文技術訊息
// 換成「發生什麼＋下一步」的中文；後端的中文業務訊息（密碼錯誤、庫存不足等）原樣顯示。
const APOLLO_PREFIX = /(?:Error:\s*)?(?:GraphQL error|Network error):\s*/g
const NETWORK_FAILURE = /(?:TypeError:\s*)?(?:Failed to fetch|NetworkError[^\n]*|Network request failed|Load failed)/i
export const NETWORK_FAILURE_MESSAGE = '網路連線異常，請檢查網路後再試一次'

export function normalizeSnackbarMessage(message, variant) {
  if (typeof message !== 'string') return message
  const stripped = message.replace(APOLLO_PREFIX, '')
  const text = NETWORK_FAILURE.test(stripped) ? stripped.replace(NETWORK_FAILURE, NETWORK_FAILURE_MESSAGE) : stripped
  return variant === 'error' || variant === 'warning' ? friendlyErrorMessage(text) : text
}

// 確認型的對話框文案；判斷順序與確認鈕的 callback 分派（下方 confirmAction）一致。只決定呈現，不影響執行內容。
function getConfirmCopy({
  resign,
  isDailyCheckout,
  salaryCheckout,
  salaryItemsLock,
  orderPending,
  deleteSystemRecordPending,
  deleteInventoryWork,
  selectedOrders,
}) {
  const reloadNote = '處理期間請勿跳頁或重新整理，完成後頁面會自動重新整理。'
  if (!resign) return { title: '確認批次編輯', confirmLabel: '確定覆蓋' }
  if (isDailyCheckout) {
    const count = Array.isArray(selectedOrders) ? selectedOrders.length : 0
    return { title: '確認日結', consequence: `將日結選取的 ${count} 天。${reloadNote}`, confirmLabel: '確定日結' }
  }
  if (salaryCheckout) return { title: '確認月結', consequence: `將結算所選月份的薪資。${reloadNote}`, confirmLabel: '結算' }
  if (salaryItemsLock) return { title: '鎖定加扣項', confirmLabel: '鎖定' }
  if (orderPending) return { title: '確認掛單', confirmLabel: '確定掛單' }
  if (deleteSystemRecordPending) return { title: '刪除版本更新紀錄', consequence: '刪除後無法復原。', confirmLabel: '刪除', danger: true }
  if (deleteInventoryWork) return { title: '刪除盤點草稿', consequence: '刪除後無法復原。', confirmLabel: '刪除', danger: true }
  return { title: '設定離職', consequence: '此員工將從本店人員名單移除，並更新可打單人員列表。', confirmLabel: '確定離職', danger: true }
}

const SnackbarContentWrapper = forwardRef((props, ref) => {
  const {
    className,
    message,
    onClose,
    variant,
    resign,
    salaryItemsLock,
    groupEdit,
    serviceHelperGroupEdit,
    designerId,
    handleSubmitDeductionSetting,
    handleSubmitHelperDeductionSetting,
    checkoutProcessing,
    progressCount,
    salaryCheckout,
    disableHide,
    monthlyCheckoutInput,
    salaryCheckoutDate,
    userSalayItemDataRefetch,
    isSalaryChackedDataRefetch,
    salaryItemLockDataRefetch,
    settingDate,
    dailyCheckoutProgress,
    isDailyCheckout,
    selectedOrders,
    waitCloseOrderResults,
    setSelectedOrders,
    checkoutStaff,
    orderPending,
    usehandleCreateDraftOrder,
    deleteSystemRecordPending,
    systemUpdateId,
    systemUpdateRecord,
    deleteInventoryWork,
    deleteInventoryWorkFunc,
    ...other
  } = props
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(waitCloseOrderResults)
  const [orderPendingBtn, setOrderPendingBtn] = useState(false)
  const { setRemoveUserFromMerchant } = useRemoveUserFromMerchant()
  const { setUserSalaryMonthlyCheckoutV2 } = useFetchSetUserSalaryMonthlyCheckoutV2()
  const { setUpdateUserOrderableList } = useFetchUpdateUserOrderableList()
  const { setUserSalaryItemLock } = useFetchSettingUserSalaryItemLock()
  const { closeDailyAccountV3 } = useFetchCloseDailyAccountV3()
  const { SystemUpdateDelete } = useFetchCreateSystemUpdateDelete()
  const [isDailyCheckoutLoading, setIsDailyCheckoutLoading] = useState(false)

  const handleResignEmployee = designerId => {
    setRemoveUserFromMerchant({ input: designerId })
      .then(() => {
        setUpdateUserOrderableList().then(() => {
          console.log('可打單人員列表更新成功')
        })
        onClose()
        openSnackbar({ message: '設定離職完成', variant: 'success' })
        window.location = '/management/employee'
      })
      .catch(() => {
        openSnackbar({ message: '設定失敗', variant: 'error' })
      })
  }
  const handleSalaryCheckout = () => {
    localStorage.removeItem('currentTime')

    const newMonthlyCheckoutInput = cloneDeep(monthlyCheckoutInput)
    const progressCount = Math.round(100 / newMonthlyCheckoutInput.length)
    setOrderPendingBtn(true)

    const closeMonthlyFunc = async dataArr => {
      for (let i = 0; i < dataArr.length; i++) {
        const resData = await setUserSalaryMonthlyCheckoutV2({
          input: dataArr[i],
          date: salaryCheckoutDate,
        })
        setProgress(pre => (pre += progressCount))
        openSnackbar({
          message: '正在月結中 請勿跳轉或刷新畫面',
          variant: 'warning',
          disableHide: true,
          checkoutProcessing: true,
        })
      }
      openSnackbar({
        message: '月結成功',
        variant: 'success',
        disableHide: false,
        checkoutProcessing: false,
      })
      userSalayItemDataRefetch()
      isSalaryChackedDataRefetch()
      window.location.reload()
    }
    closeMonthlyFunc(newMonthlyCheckoutInput)
  }

  // 每日結帳
  const dailyCheckout = () => {
    setIsDailyCheckoutLoading(true)
    const newSelectedOrders = cloneDeep(selectedOrders)
    let newResults = cloneDeep(results)
    const progressCount = Math.round(100 / selectedOrders.length)
    const closeDailyAccountV3Func = async dateArr => {
      for (let i = 0; i < dateArr.length; i++) {
        const resData = await closeDailyAccountV3({
          date: dateArr[i],
          checkoutStaff: checkoutStaff.id,
        })
        setProgress(pre => (pre += progressCount))

        openSnackbar({
          message: '正在日結中 請勿跳轉或刷新畫面',
          variant: 'warning',
          disableHide: true,
          checkoutProcessing: true,
        })
        newResults = newResults.filter(d => d.date !== dateArr[i])
        setResults(newResults)
      }
      openSnackbar({
        message: '日結成功',
        variant: 'success',
        disableHide: false,
        checkoutProcessing: false,
      })
      setIsDailyCheckoutLoading(false)
      setSelectedOrders([])
      window.location.reload()
    }
    closeDailyAccountV3Func(newSelectedOrders)
  }

  const handleSubmitDeduction = () => {
    handleSubmitDeductionSetting()
  }
  const handleSubmitHelperDeduction = () => {
    handleSubmitHelperDeductionSetting()
  }

  const handleSalaryItemsLock = () => {
    setUserSalaryItemLock({ date: settingDate }).then(res => {
      salaryItemLockDataRefetch()
      window.location.reload()
      openSnackbar({
        message: '加扣項已鎖定',
        variant: 'warning',
        disableHide: false,
      })
    })
  }
  const usehandleCreateDraftOrderFunc = () => {
    setOrderPendingBtn(true)
    usehandleCreateDraftOrder()
  }
  const deleteSystemRecordFunc = () => {
    SystemUpdateDelete({
      systemUpdateId: systemUpdateId,
    })
      .then(res => {
        if (res.data.deleteSystemUpdate) {
          openSnackbar({
            message: '刪除成功',
            variant: 'success',
          })
          systemUpdateRecord.refetch()
        } else {
          openSnackbar({
            message: '刪除失敗',
            variant: 'error',
          })
        }
      })
      .catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
      })
  }
  // 確認型：對話框（取消／Esc／點背景只關閉；確認鈕的分派與停用條件與原本相同）
  if (resign || groupEdit) {
    const copy = getConfirmCopy({
      resign,
      isDailyCheckout,
      salaryCheckout,
      salaryItemsLock,
      orderPending,
      deleteSystemRecordPending,
      deleteInventoryWork,
      selectedOrders,
    })
    const confirmAction = resign
      ? isDailyCheckout
        ? () => dailyCheckout()
        : () =>
            salaryCheckout
              ? handleSalaryCheckout()
              : salaryItemsLock
                ? handleSalaryItemsLock()
                : orderPending
                  ? usehandleCreateDraftOrderFunc()
                  : deleteSystemRecordPending
                    ? deleteSystemRecordFunc()
                    : deleteInventoryWork
                      ? deleteInventoryWorkFunc()
                      : handleResignEmployee(designerId)
      : () => (serviceHelperGroupEdit ? handleSubmitHelperDeduction() : handleSubmitDeduction())
    const confirmDisabled = resign ? (isDailyCheckout ? isDailyCheckoutLoading : orderPendingBtn) : undefined
    return (
      <Dialog
        open
        onOpenChange={value => {
          if (!value) onClose()
        }}
      >
        <DialogContent size="sm" hideClose role="alertdialog" aria-describedby="client-snackbar">
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div id="client-snackbar" className="flex flex-col gap-2">
              <p className="whitespace-pre-line text-body text-text">{typeof message === 'string' ? message.trim() : message}</p>
              {copy.consequence && <p className="text-body text-text-secondary">{copy.consequence}</p>}
            </div>
          </DialogBody>
          <DialogFooter className="gap-2 max-sm:[&>button]:flex-1">
            <Button variant="secondary" onClick={() => onClose()}>
              取消
            </Button>
            <Button variant={copy.danger ? 'danger' : 'primary'} onClick={confirmAction} disabled={confirmDisabled}>
              {confirmDisabled && <LoaderCircle className="animate-spin" strokeWidth={1.75} aria-hidden="true" />}
              {confirmDisabled ? '處理中…' : copy.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // 純訊息：右下角提示卡；月結／日結進行中以定值圓＋%取代關閉鈕（不可關閉，原本也只留空白按鈕）
  return (
    <ToastCard
      ref={ref}
      variant={variant}
      title={<span id="client-snackbar">{message}</span>}
      onClose={checkoutProcessing ? undefined : onClose}
      trailing={
        checkoutProcessing && (
          <div className="relative inline-flex shrink-0">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              role="progressbar"
              aria-label="結帳進度"
              aria-valuenow={progress <= 100 ? progress : 99}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <circle cx="20" cy="20" r="18" fill="none" stroke="rgb(var(--border))" strokeWidth="3.6" />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="rgb(var(--primary))"
                strokeWidth="3.6"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - (progress <= 100 ? progress : 99)}
                transform="rotate(-90 20 20)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-caption tabular-nums text-text-secondary">{progress <= 100 ? progress : 99}%</div>
            </div>
          </div>
        )
      }
      {...other}
    />
  )
})

SnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']).isRequired,
}

let openSnackbarFunction = () => {}

export function openSnackbar({
  message,
  variant,
  horizontal,
  vertical,
  disableHide,
  resign,
  salaryItemsLock,
  groupEdit,
  serviceHelperGroupEdit,
  designerId,
  handleSubmitDeductionSetting,
  handleSubmitHelperDeductionSetting,
  salaryCheckout,
  checkoutProcessing,
  progressCount,
  monthlyCheckoutInput,
  salaryCheckoutDate,
  userSalayItemDataRefetch,
  isSalaryChackedDataRefetch,
  salaryItemLockDataRefetch,
  settingDate,
  dailyCheckoutProgress,
  isDailyCheckout,
  selectedOrders,
  waitCloseOrderResults,
  setSelectedOrders,
  checkoutStaff,
  orderPending,
  usehandleCreateDraftOrder,
  deleteSystemRecordPending,
  systemUpdateId,
  systemUpdateRecord,
  deleteInventoryWork,
  deleteInventoryWorkFunc,
}) {
  openSnackbarFunction({
    message: normalizeSnackbarMessage(message, variant),
    variant,
    horizontal,
    vertical,
    disableHide,
    resign,
    salaryItemsLock,
    groupEdit,
    serviceHelperGroupEdit,
    designerId,
    handleSubmitDeductionSetting,
    handleSubmitHelperDeductionSetting,
    salaryCheckout,
    checkoutProcessing,
    progressCount,
    monthlyCheckoutInput,
    salaryCheckoutDate,
    userSalayItemDataRefetch,
    isSalaryChackedDataRefetch,
    salaryItemLockDataRefetch,
    settingDate,
    dailyCheckoutProgress,
    isDailyCheckout,
    selectedOrders,
    waitCloseOrderResults,
    setSelectedOrders,
    checkoutStaff,
    orderPending,
    usehandleCreateDraftOrder,
    deleteSystemRecordPending,
    systemUpdateId,
    systemUpdateRecord,
    deleteInventoryWork,
    deleteInventoryWorkFunc,
  })
}

export default function CustomizedSnackbars() {
  const openSnackbar = ({
    message,
    variant,
    horizontal,
    vertical,
    disableHide,
    resign,
    salaryItemsLock,
    groupEdit,
    serviceHelperGroupEdit,
    designerId,
    handleSubmitDeductionSetting,
    handleSubmitHelperDeductionSetting,
    salaryCheckout,
    checkoutProcessing,
    progressCount,
    monthlyCheckoutInput,
    salaryCheckoutDate,
    userSalayItemDataRefetch,
    isSalaryChackedDataRefetch,
    salaryItemLockDataRefetch,
    settingDate,
    dailyCheckoutProgress,
    isDailyCheckout,
    selectedOrders,
    waitCloseOrderResults,
    setSelectedOrders,
    checkoutStaff,
    orderPending,
    usehandleCreateDraftOrder,
    deleteSystemRecordPending,
    systemUpdateId,
    systemUpdateRecord,
    deleteInventoryWork,
    deleteInventoryWorkFunc,
  }) => {
    setSnackbarState({
      open: true,
      message,
      variant,
      horizontal,
      vertical,
      disableHide,
      resign,
      salaryItemsLock,
      groupEdit,
      serviceHelperGroupEdit,
      designerId,
      handleSubmitDeductionSetting,
      handleSubmitHelperDeductionSetting,
      salaryCheckout,
      checkoutProcessing,
      progressCount,
      monthlyCheckoutInput,
      salaryCheckoutDate,
      userSalayItemDataRefetch,
      isSalaryChackedDataRefetch,
      salaryItemLockDataRefetch,
      settingDate,
      dailyCheckoutProgress,
      isDailyCheckout,
      selectedOrders,
      waitCloseOrderResults,
      setSelectedOrders,
      checkoutStaff,
      orderPending,
      usehandleCreateDraftOrder,
      deleteSystemRecordPending,
      systemUpdateId,
      systemUpdateRecord,
      deleteInventoryWork,
      deleteInventoryWorkFunc,
    })
  }
  useEffect(() => {
    openSnackbarFunction = openSnackbar
  }, [])

  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    variant: 'success',
    horizontal: 'center',
    vertical: 'top',
    disableHide: false,
    resign: false,
    salaryItemsLock: false,
    groupEdit: false,
    serviceHelperGroupEdit: false,
    designerId: '',
    handleSubmitDeductionSetting: () => {},
    handleSubmitHelperDeductionSetting: () => {},
    salaryCheckout: false,
    checkoutProcessing: false,
    progressCount: 0,
    settingDate: null,
    dailyCheckoutProgress: 0,
    isDailyCheckout: false,
    selectedOrders: [],
    waitCloseOrderResults: null,
    setSelectedOrders: () => {},
    checkoutStaff: null,
    orderPending: false,
    usehandleCreateDraftOrder: () => {},
    deleteSystemRecordPending: false,
    systemUpdateId: '',
    systemUpdateRecord: () => {},
    deleteInventoryWork: false,
    deleteInventoryWorkFunc: () => {},
  })

  const {
    open,
    message,
    variant,
    horizontal,
    vertical,
    disableHide,
    resign,
    salaryItemsLock,
    groupEdit,
    serviceHelperGroupEdit,
    designerId,
    handleSubmitDeductionSetting,
    handleSubmitHelperDeductionSetting,
    salaryCheckout,
    checkoutProcessing,
    progressCount,
    monthlyCheckoutInput,
    salaryCheckoutDate,
    userSalayItemDataRefetch,
    isSalaryChackedDataRefetch,
    salaryItemLockDataRefetch,
    settingDate,
    dailyCheckoutProgress,
    isDailyCheckout,
    selectedOrders,
    waitCloseOrderResults,
    setSelectedOrders,
    checkoutStaff,
    orderPending,
    usehandleCreateDraftOrder,
    deleteSystemRecordPending,
    systemUpdateId,
    systemUpdateRecord,
    deleteInventoryWork,
    deleteInventoryWorkFunc,
  } = snackbarState
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarState({ ...snackbarState, open: false })
  }

  // 自動消失：每則新訊息重新計時；確認型、disableHide、錯誤不自動消失（STYLE §6）；滑鼠移入或聚焦時暫停，移出後以一半時間重新計時（同原 Snackbar）。
  // 取代原本兩個計時器（Snackbar 的 autoHideDuration＋依 checkoutProcessing 觸發、閉包抓舊 state 的 setTimeout——後者會在版面掛載後 3 秒內把剛開的確認框關掉）
  const latestClose = useRef(handleClose)
  latestClose.current = handleClose
  const hideTimer = useRef(null)
  const autoHide = open && !resign && !groupEdit && !disableHide && variant !== 'error' ? AUTO_HIDE_MS : null
  const startHideTimer = duration => {
    clearTimeout(hideTimer.current)
    if (duration == null) return
    hideTimer.current = setTimeout(() => latestClose.current(), duration)
  }
  useEffect(() => {
    startHideTimer(autoHide)
    return () => clearTimeout(hideTimer.current)
  }, [snackbarState, autoHide])
  const pauseHide = () => clearTimeout(hideTimer.current)
  const resumeHide = () => startHideTimer(autoHide == null ? null : autoHide * 0.5)

  // 全站唯一的提示區（右下角）；openSnackbar 的訊息槽放在佇列最前面
  return (
    <Toaster>
      {open && (
        <SnackbarContentWrapper
          // onClose={handleClose}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick') {
              handleClose()
            }
          }}
          onMouseEnter={pauseHide}
          onMouseLeave={resumeHide}
          onFocus={pauseHide}
          onBlur={resumeHide}
          variant={variant}
          message={message}
          resign={resign}
          salaryItemsLock={salaryItemsLock}
          groupEdit={groupEdit}
          serviceHelperGroupEdit={serviceHelperGroupEdit}
          designerId={designerId}
          handleSubmitDeductionSetting={handleSubmitDeductionSetting}
          handleSubmitHelperDeductionSetting={handleSubmitHelperDeductionSetting}
          disableHide={disableHide}
          salaryCheckout={salaryCheckout}
          checkoutProcessing={checkoutProcessing}
          progressCount={progressCount}
          monthlyCheckoutInput={monthlyCheckoutInput}
          salaryCheckoutDate={salaryCheckoutDate}
          userSalayItemDataRefetch={userSalayItemDataRefetch}
          isSalaryChackedDataRefetch={isSalaryChackedDataRefetch}
          salaryItemLockDataRefetch={salaryItemLockDataRefetch}
          settingDate={settingDate}
          dailyCheckoutProgress={dailyCheckoutProgress}
          isDailyCheckout={isDailyCheckout}
          selectedOrders={selectedOrders}
          waitCloseOrderResults={waitCloseOrderResults}
          setSelectedOrders={setSelectedOrders}
          checkoutStaff={checkoutStaff}
          orderPending={orderPending}
          usehandleCreateDraftOrder={usehandleCreateDraftOrder}
          deleteSystemRecordPending={deleteSystemRecordPending}
          systemUpdateId={systemUpdateId}
          systemUpdateRecord={systemUpdateRecord}
          deleteInventoryWork={deleteInventoryWork}
          deleteInventoryWorkFunc={deleteInventoryWorkFunc}
        />
      )}
    </Toaster>
  )
}
