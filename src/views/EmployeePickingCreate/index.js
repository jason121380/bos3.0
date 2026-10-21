import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchAddPicking from 'hooks/useFetchAddPicking'
import useFetchGetEmployeePickingPurpose from 'hooks/useFetchGetEmployeePickingPurpose'
import idx from 'idx'
import produce from 'immer'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'

import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { PageHeader } from 'ui/page-header'
import General from './General'

export default function EmployeePickingCreate({ location }) {
  const stayInCreatePickingInMemory = JSON.parse(localStorage.getItem('stayInCreatePicking'))
  const getEmployeePickingPurpose = useFetchGetEmployeePickingPurpose()
  const history = useHistory()
  const [stayInCreatePicking, setStayInCreatePicking] = useState(
    stayInCreatePickingInMemory !== null ? stayInCreatePickingInMemory : false
  )
  const [purpose, setPurpose] = useState([])
  const [picking, setPicking] = useState({
    date: new Date().getTime(),
    productList: [
      {
        productName: '',
        productNo: '',
        price: 0,
        count: 0,
        total: 0,
      },
    ],
    purpose: '',
    remark: '',
    PickerId: '',
  })
  const [pageLoading, setPageLoading] = useState(true)
  const { addPicking } = useFetchAddPicking()

  useEffect(() => {
    if (!getEmployeePickingPurpose.loading) {
      const data = idx(getEmployeePickingPurpose, _ => _.data.getEmployeePickingPurpose)
      setPurpose(data)
    }
  }, [getEmployeePickingPurpose.loading])

  useEffect(() => {
    if (location.search.split('=')[1] !== undefined) {
      history.push(`/employee/picking/create?date=${location.search.split('=')[1]}`)
      setPicking(
        produce(draft => {
          draft.date = Number(location.search.split('=')[1])
        })
      )
    }
  }, [history])
  const [isClick, setIsClick] = useState(true)
  const handleOnChange = ({ event, key }) => {
    if (event && event.persist) event.persist()
    setPicking(
      produce(draft => {
        if (key === 'date') {
          history.push(`/employee/picking/create?date=${event}`)
          draft[key] = event
        } else draft[key] = idx(event, _ => _.target.value)
      })
    )
  }

  const handleSubmit = () => {
    setIsClick(true)

    const newPicking = cloneDeep(picking)
    let newProductList = newPicking.productList.filter(
      data => data.productName !== '' || data.productNo !== ''
    )
    newProductList = newPicking.productList.map(({ productCategory, selected, ...keep }) => keep)
    newProductList = newProductList.filter(data => data.productName !== '' || data.productNo !== '')
    const subData = { ...picking, productList: newProductList }

    addPicking({
      input: subData,
    }).then(res => {
      if (res.data.addPicking) {
        openSnackbar({ message: '成功新增領料', variant: 'success' })

        if (stayInCreatePicking) {
          if (location.search.split('=')[1] !== undefined) {
            window.location.href = `/employee/picking/create?date=${location.search.split('=')[1]}`
          } else {
            window.location.href = '/employee/picking/create'
          }
        } else {
          history.push('/employee/picking')
        }
      } else {
        openSnackbar({ message: '新增領料失敗', variant: 'error' })
        setIsClick(false)
      }
    }).catch(err => {
      openSnackbar({ message: err.message, variant: 'error' })
      setIsClick(false)
    })
  }
  const handleStayInCreatePicking = () => {
    if (!stayInCreatePicking) {
      setStayInCreatePicking(true)
      localStorage.setItem('stayInCreatePicking', true)
    } else {
      localStorage.removeItem('stayInCreatePicking')
      setStayInCreatePicking(false)
    }
  }
  // 頁面外距由 #printContainer 提供；表單頁內容寬度沿用舊版 700px
  return (
    <Page title="新增材料自購" className="ui-root">
      <div className="mx-auto min-w-[300px] max-w-[700px]">
        <PageHeader
          title='新增材料自購'
          actions={
            <label className="flex cursor-pointer items-center gap-2 text-body text-text">
              <Checkbox checked={stayInCreatePicking} onChange={handleStayInCreatePicking} />
              連續新增自購
            </label>
          }
        />
        <General
          className="mt-6"
          picking={picking}
          setPicking={setPicking}
          onChange={handleOnChange}
          setPageLoading={setPageLoading}
          setIsClick={setIsClick}
          purpose={purpose}
        />
        {!pageLoading && (
          <Button
            variant="primary"
            className="mt-6"
            disabled={isClick}
            onClick={handleSubmit}
          >
            新增
          </Button>
        )}
      </div>
    </Page>
  )
}
