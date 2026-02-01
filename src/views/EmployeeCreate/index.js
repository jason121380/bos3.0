/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateUser from 'hooks/useFetchCreateUser'
import useFetchUsers from 'hooks/useFetchUsers'
import idx from 'idx'
import produce from 'immer'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutEmployee from './AboutEmployee'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutPayment: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

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
      ))
      const point = idx(merchantJobTitlePoint.data, _ => _.merchantJobTitlePoint)
      point.map(d => {
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
    <Page css={styles.root} title="新增員工">
      <Container maxWidth="md">
        <PageTitle title='新增員工' subTitle='Create Employee' />
        <AboutEmployee
          className={styles.aboutPayment}
          onChange={handleOnChange}
          employee={employee}
          service={service}
          setEmployee={setEmployee}
        />
        <div css={styles.actions}>
          <Button color="primary" variant="contained" onClick={handleOnClick} disabled={vaild}>
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default ServiceCategoryCreate
