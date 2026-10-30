import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog'
import { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router'
import { Provider } from 'hooks/useStore'
import useFetchDeletePicking from 'hooks/useFetchDeletePicking'
import useFetchGetEmployeePickingPurpose from 'hooks/useFetchGetEmployeePickingPurpose'
import useFetchGetPicking from 'hooks/useFetchGetPicking'
import useFetchUpdatePicking from 'hooks/useFetchUpdatePicking'
import idx from 'idx'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import General from './General'
import QueryFailed from 'components/QueryFailed'

export default function EmployeePickingCreate() {
  const history = useHistory()
  const params = useParams()
  const value = { id: params.id }
  const { deletePicking } = useFetchDeletePicking()
  const getEmployeePickingPurpose = useFetchGetEmployeePickingPurpose()
  const getPicking = useFetchGetPicking(params.id)
  const { updatePicking } = useFetchUpdatePicking()
  const [purpose, setPurpose] = useState([])
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [formState, setFormState] = useState({
    date: new Date().getTime(),
    productName: '',
    productNo: '',
    price: 0,
    count: 0,
    purpose: '',
    remark: null,
    PickerId: '',
    PickerName: '',
  })

  useEffect(() => {
    if (!getEmployeePickingPurpose.loading) {
      const data = idx(getEmployeePickingPurpose, _ => _.data.getEmployeePickingPurpose)
      setPurpose(data || [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getEmployeePickingPurpose.loading])

  useEffect(() => {
    // 查詢失敗或查無紀錄時沒有資料：維持空白表單，不讓整頁拋錯
    if (!getPicking.loading && idx(getPicking, _ => _.data.picking)) {
      setFormState({
        date: getPicking.data.picking.date,
        productName: getPicking.data.picking.productName,
        productNo: getPicking.data.picking.productNo,
        price: getPicking.data.picking.price,
        count: getPicking.data.picking.count,
        purpose: getPicking.data.picking.purpose,
        remark: getPicking.data.picking.remark,
        PickerId: getPicking.data.picking.Picker.id,
        PickerName: getPicking.data.picking.Picker.name,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getPicking.loading])

  const dateHandler = value => {
    setFormState({ ...formState, date: new Date(value).getTime() })
  }

  const productHandler = value => {
    setFormState({
      ...formState,
      price: value ? value.sellPrice : 0,
      productName: value ? value.name : '',
      productNo: value ? value.no : '',
    })
  }

  const changeHandler = (target, value) => {
    if (target === 'PickerId') {
      const id = value ? value.id : ''
      const name = value ? value.name : ''
      setFormState({ ...formState, PickerName: name, PickerId: id })
    } else {
      setFormState({ ...formState, [target]: value })
    }
  }

  const submitHandler = () => {
    const total = formState.price * formState.count
    updatePicking({
      id: params.id,
      input: {
        date: formState.date,
        productName: formState.productName,
        productNo: formState.productNo,
        price: formState.price,
        count: formState.count,
        purpose: formState.purpose,
        remark: formState.remark,
        PickerId: formState.PickerId,
        total,
      },
    })
      .then(() => {
        openSnackbar({ message: '更新領料成功', variant: 'success' })
        history.push('/employee/picking')
      })
      .catch(err => openSnackbar({ message: err.message, variant: 'error' }))
  }

  const handleDelete = () => {
    deletePicking(params.id).then(() => {
      openSnackbar({
        message: '刪除 員工領料/自購 成功',
        variant: 'success',
      })
      history.push('/employee/picking')
    })
  }
  return (
    <Page title="編輯材料自購" className="ui-root">
      <div className="mx-auto max-w-3xl">
        <Provider value={value}>
          <PageHeader
            title="編輯材料自購"
            actions={
              <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                刪除
              </Button>
            }
          />
          <ConfirmDeleteDialog
            open={confirmingDelete}
            onClose={() => setConfirmingDelete(false)}
            title="刪除領料／自購紀錄"
            message="刪除這筆領料／自購紀錄？"
            onConfirm={() => {
              setConfirmingDelete(false)
              handleDelete()
            }}
          />
          {getPicking.error ? (
            <QueryFailed onRetry={() => getPicking.refetch()} />
          ) : (
            <General
              formState={formState}
              changeHandler={changeHandler}
              productHandler={productHandler}
              dateHandler={dateHandler}
              purpose={purpose}
            />
          )}
        </Provider>
        <div className="mt-6 flex justify-end" hidden={Boolean(getPicking.error)}>
          <Button variant="primary" onClick={submitHandler}>
            儲存
          </Button>
        </div>
      </div>
    </Page>
  )
}
