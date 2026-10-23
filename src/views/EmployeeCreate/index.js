import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateUser from 'hooks/useFetchCreateUser'
import useFetchUsers from 'hooks/useFetchUsers'
import idx from 'idx'
import produce from 'immer'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutEmployee from './AboutEmployee'

function ServiceCategoryCreate() {
  const history = useHistory()
  const users = useFetchUsers({ pageLimit: 5, pageOffset: 0, keyword: '' })
  const { createUser } = useFetchCreateUser()
  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()

  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    cellphone: '',
    jobPointId: '',
  })
  const [service, setService] = useState([{
    id: '',
    jobTitle: '',
    pointValue: 0,
  }])
  const [createBtnDisabled, setCreateBtnDisabled] = useState(false)
  useEffect(() => {
    if (!merchantJobTitlePoint.loading) {
      setService(idx(merchantJobTitlePoint.data, _ =>
        _.merchantJobTitlePoint.length > 0
          ? _.merchantJobTitlePoint.map(d => ({
            id: d.id,
            jobTitle: d.jobTitle,
            pointValue: d.pointValue,
          }))
          : [{
            id: '',
            jobTitle: '',
            pointValue: 0,
          }]
      // 人員身分查詢失敗時以空清單處理（只有「未設定」），仍可新增員工（Jason 2026/10/22；原本整頁錯誤）
      ) || [{
        id: '',
        jobTitle: '',
        pointValue: 0,
      }])
      const point = idx(merchantJobTitlePoint.data, _ => _.merchantJobTitlePoint) || []
      point.forEach(d => {
        if (d.isDefaultValue === true) {
          setEmployee({
            ...employee,
            jobPointId: d.id,
          })
        }
      })
    }
  }, [merchantJobTitlePoint.loading])
  const handleOnChange = ({ event, key }) => {
    if (event.persist) event.persist()
    setEmployee(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }

  const handleOnClick = () => {
    setCreateBtnDisabled(true)
    if (employee.cellphone.trim().length < 7) {
      openSnackbar({
        message: '手機長度必須大於六碼',
        variant: 'warning',
      })
      setCreateBtnDisabled(false)
    } else {
      let checkInput = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        cellphone: employee.cellphone
      }
      if (employee.jobPointId !== '' && employee.jobPointId !== '未設定') {
        checkInput = {
          ...checkInput,
          jobPointId: employee.jobPointId
        }
      }
      createUser({ input: checkInput })
        .then(() => {
          users.refetch({
            variables: {
              pageLimit: 10,
              pageOffset: 0,
              keyword: '',
            },
          })
          openSnackbar({
            message: '成功新增員工',
            variant: 'success',
          })
          setCreateBtnDisabled(false)
          history.push('/management/employee')
        })
        .catch((error) => {
          setCreateBtnDisabled(false)
          openSnackbar({
            message: error.message,
            variant: 'error',
          })
        })
    }

  }

  const vaild = !(
    employee.firstName &&
    employee.lastName &&
    employee.cellphone &&
    !createBtnDisabled
  )
  return (
    <Page className="ui-root" title="新增員工">
      <div className="mx-auto max-w-3xl">
        <PageHeader title='新增員工' />
        <AboutEmployee
          onChange={handleOnChange}
          employee={employee}
          service={service}
          setEmployee={setEmployee}
        />
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={handleOnClick} disabled={vaild}>
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
