import { useEffect } from 'react'
import { useHistory } from 'react-router'
import { openSnackbar } from 'elements/snackbars'
import { useFetchGetDisablePendingOrder } from 'hooks/useFetchGetParameterAboutSettingFunction'

const useCheckDisablePendingOrder = () => {
  const history = useHistory()
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()

  useEffect(() => {
    if (!getDisablePendingOrder.loading) {
      const { disablePendingOrder } = getDisablePendingOrder.data.getParameterAboutSettingFunction
      if (disablePendingOrder) {
        openSnackbar({
          variant: 'warning',
          message: '掛單功能已關閉'
        })
        history.push('/order/create')
      }
    }
  }, [getDisablePendingOrder.loading])
}

export default useCheckDisablePendingOrder 