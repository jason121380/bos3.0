/** @jsxImportSource @emotion/react */
import { Button, Container, Grid } from '@mui/material'
import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router'
import { Provider } from 'hooks/useStore'
import red from '@mui/material/colors/red'
import PageTitle from 'components/PageTitle'
import useFetchDeletePicking from 'hooks/useFetchDeletePicking'
import useFetchGetEmployeePickingPurpose from 'hooks/useFetchGetEmployeePickingPurpose'
import useFetchGetPicking from 'hooks/useFetchGetPicking'
import useFetchUpdatePicking from 'hooks/useFetchUpdatePicking'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'

const styles = {
  root: css({
    padding: theme.spacing(3),
  }),
  general: css({
    marginTop: theme.spacing(3),
  }),
  action: css({
    marginTop: theme.spacing(3) + '!important',
  }),
  delete: css({
    backgroundColor: red[700] + '!important',
    '&:hover, &:active': {
      backgroundColor: red[600] + '!important',
    },
    color: '#fff !important'
  }),
}

export default function EmployeePickingCreate() {
  const history = useHistory()
  const params = useParams()
  const value = { id: params.id }
  const { deletePicking } = useFetchDeletePicking()
  const getEmployeePickingPurpose = useFetchGetEmployeePickingPurpose()
  const getPicking = useFetchGetPicking(params.id)
  const { updatePicking } = useFetchUpdatePicking()
  const [purpose, setPurpose] = useState([])
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
      setPurpose(data)
    }
  }, [getEmployeePickingPurpose.loading])

  useEffect(() => {
    if (!getPicking.loading) {
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
      }
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
    <Page title="編輯材料自購" css={styles.root}>
      <Container maxWidth="sm">
        <Provider value={value}>
          <Grid container item justifyContent='space-between' alignItems='center'>
            <PageTitle title='編輯材料自購' subTitle='Employee Picking Edit' />
            <Grid item>
              <Button
                css={styles.delete}
                variant="contained"
                onClick={handleDelete}
              >
                刪除
              </Button>
            </Grid>
          </Grid>
          <General
            className={styles.general}
            formState={formState}
            changeHandler={changeHandler}
            productHandler={productHandler}
            dateHandler={dateHandler}
            purpose={purpose}
          />
        </Provider>
        <Button
          color="primary"
          variant="contained"
          css={styles.action}
          onClick={submitHandler}
        >
          儲存
        </Button>
      </Container>
    </Page>
  )
}
