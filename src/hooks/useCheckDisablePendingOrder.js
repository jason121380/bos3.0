import { useEffect } from 'react'
import { useHistory } from 'react-router'
import { openSnackbar } from 'elements/snackbars'
import { useFetchGetDisablePendingOrder } from 'hooks/useFetchGetParameterAboutSettingFunction'

const useCheckDisablePendingOrder = () => {
  const history = useHistory()
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()

  useEffect(() => {
    // 查詢失敗時 data 為 undefined：不拋錯、不導頁（errorLink 已提示；Jason 2026/10/22 fix all，原本整頁變成錯誤畫面）
    if (!getDisablePendingOrder.loading && getDisablePendingOrder.data) {
      const { disablePendingOrder } = getDisablePendingOrder.data.getParameterAboutSettingFunction
      if (disablePendingOrder) {
        openSnackbar({
          variant: 'warning',
          message: '掛單功能已關閉'
        })
        history.push('/order/create')
      }
    }
  }, [getDisablePendingOrder.loading, history])
}

export default useCheckDisablePendingOrder 