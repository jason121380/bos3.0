/** @jsxImportSource @emotion/react */
import { amber, green } from '@mui/material/colors'
import {
  Button, colors, CircularProgress,
  SnackbarContent, Snackbar
} from '@mui/material'
import { Button as UiButton } from 'ui/button'
import { CheckCircle as CheckCircleIcon, Close as CloseIcon, Error as ErrorIcon, Info as InfoIcon, Warning as WarningIcon } from 'ui/icons'
import PropTypes from 'prop-types'
import { useEffect, useState, Fragment, forwardRef } from 'react'
import useRemoveUserFromMerchant from 'hooks/useRemoveUserFromMerchant'
import useFetchSetUserSalaryMonthlyCheckoutV2 from 'hooks/useFetchSetUserSalaryMonthlyCheckoutV2'
import useFetchUpdateUserOrderableList from 'hooks/useFetchSettingUpdateUserOrderableList'
import useFetchSettingUserSalaryItemLock from 'hooks/useFetchSetLockUserSalaryItem'
import useFetchCloseDailyAccountV3 from 'hooks/useFetchCloseDailyAccountV3'
import { useFetchCreateSystemUpdateDelete } from 'hooks/useFetchSystemUpdateRecord'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../theme'

const variantIcon = {
  success: props => <CheckCircleIcon  {...props} />,
  warning: props => <WarningIcon  {...props} />,
  error: props => <ErrorIcon  {...props} />,
  info: props => <InfoIcon  {...props} />,
}

const styles = {
  success: css({
    backgroundColor: green[600] + '!important',
  }),
  error: css({
    backgroundColor: theme.palette.error.dark + '!important',
  }),
  info: css({
    backgroundColor: theme.palette.primary.main + '!important',
  }),
  warning: css({
    backgroundColor: amber[700] + '!important',
  }),
  icon: css({
    fontSize: '20px !important',
    color: '#fff',
    opacity: 0.9,
  }),
  iconVariant: css({
    marginRight: theme.spacing(1),
  }),
  message: css({
    display: 'flex',
    alignItems: 'center',
    color: '#fff'
  }),
  resignBtnDiv: css({
    margin: '7px 0px',
    textAlign: 'center',
  }),
  confirmResignBtn: css({
    backgroundColor: colors.orange[500] + '!important',
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: colors.orange[700],
    },
  }),
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
  const Icon = props => variantIcon[variant](props)
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

    const newMonthlyCheckoutInput = _.cloneDeep(monthlyCheckoutInput)
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
    const newSelectedOrders = _.cloneDeep(selectedOrders)
    let newResults = _.cloneDeep(results)
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
  return (
    <SnackbarContent
      ref={ref}
      css={styles[variant]}
      aria-describedby="client-snackbar"
      message={
        resign ? (
          isDailyCheckout ? (
            <Fragment>
              <span id="client-snackbar" css={styles.message}>
                <Icon css={css([styles.icon, styles.iconVariant])} />
                {message}
              </span>
              <div css={styles.resignBtnDiv}>
                <Button
                  variant="contained"
                  size="small"
                  css={styles.confirmResignBtn}
                  onClick={() => dailyCheckout()}
                  disabled={isDailyCheckoutLoading}
                >
                  確定
                </Button>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <span id="client-snackbar" css={styles.message}>
                <Icon css={css([styles.icon, styles.iconVariant])} />
                {message}
              </span>
              <div css={styles.resignBtnDiv}>
                <Button
                  variant="contained"
                  size="small"
                  css={styles.confirmResignBtn}
                  onClick={() =>
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
                  }
                  disabled={orderPendingBtn}
                >
                  {salaryCheckout ? '結算' : '確定'}
                </Button>
              </div>
            </Fragment>
          )
        ) : groupEdit ? (
          <Fragment>
            <span id="client-snackbar" css={styles.message}>
              <Icon css={css([styles.icon, styles.iconVariant])} />
              {message}
            </span>
            <div css={styles.resignBtnDiv}>
              <Button
                variant="contained"
                size="small"
                css={styles.confirmResignBtn}
                onClick={() =>
                  serviceHelperGroupEdit ? handleSubmitHelperDeduction() : handleSubmitDeduction()
                }
              >
                確定
              </Button>
            </div>
          </Fragment>
        ) : (
          <span id="client-snackbar" css={styles.message}>
            <Icon css={css([styles.icon, styles.iconVariant])} />
            {message}
            {checkoutProcessing && (
              <div className="relative inline-flex">
                <CircularProgress variant="determinate" value={progress <= 100 ? progress : 99} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-caption text-text-secondary">
                    {progress <= 100 ? progress : 99}%
                  </div>
                </div>
              </div>
            )}
          </span>
        )
      }
      action={[
        <UiButton key="close" variant="ghost" size="icon" className="h-8 w-8" aria-label="close" title="關閉" onClick={onClose}>
          {!checkoutProcessing && <CloseIcon css={styles.icon} />}
        </UiButton>,
      ]}
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

let openSnackbarFunction = () => { }

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
  deleteInventoryWorkFunc
}) {
  openSnackbarFunction({
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
    deleteInventoryWorkFunc
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
    deleteInventoryWorkFunc
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
      deleteInventoryWorkFunc
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
    handleSubmitDeductionSetting: () => { },
    handleSubmitHelperDeductionSetting: () => { },
    salaryCheckout: false,
    checkoutProcessing: false,
    progressCount: 0,
    settingDate: null,
    dailyCheckoutProgress: 0,
    isDailyCheckout: false,
    selectedOrders: [],
    waitCloseOrderResults: null,
    setSelectedOrders: () => { },
    checkoutStaff: null,
    orderPending: false,
    usehandleCreateDraftOrder: () => { },
    deleteSystemRecordPending: false,
    systemUpdateId: '',
    systemUpdateRecord: () => { },
    deleteInventoryWork: false,
    deleteInventoryWorkFunc: () => { }
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
    deleteInventoryWorkFunc
  } = snackbarState
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarState({ ...snackbarState, open: false })
  }

  useEffect(() => {
    if (!checkoutProcessing && !disableHide) {
      setTimeout(() => {
        setSnackbarState({ ...snackbarState, open: false })
      }, 3000)
    }
  }, [checkoutProcessing])

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: vertical || 'top',
          horizontal: horizontal || 'center',
        }}
        open={open}
        autoHideDuration={disableHide ? null : 3000}
        // onClose={handleClose}
        onClose={(_, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <SnackbarContentWrapper
          // onClose={handleClose}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick') {
              handleClose()
            }
          }}
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
      </Snackbar>
    </div>
  )
}
