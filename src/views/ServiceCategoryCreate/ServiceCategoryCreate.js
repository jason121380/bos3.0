/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchServiceCategoryCreate from 'hooks/useFetchServiceCategoryCreate'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { Provider } from 'hooks/useStore'
import useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutServiceCategory from './AboutServiceCategory'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  aboutServiceCategory: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

function ServiceCategoryCreate() {
  const history = useHistory()
  const [attributions, setAttributions] = useState([])
  const [attr, setAttr] = useState('燙')
  const getAttribution = useFetchGetAttribution()
  const { register, handleSubmit, errors } = useForm({
    defaultValues: {
      attribution: '燙',
    },
    validationFields: ['attribution'],
  })

  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  const { createServiceCategory } = useFetchServiceCategoryCreate()

  const onSubmit = data => {
    const serviceCategory = {
      ...data,
      OfficialBrandMerchantId: merchantId,
      attribution: attr
    }
    createServiceCategory(serviceCategory).then(() => {
      openSnackbar({
        variant: 'success',
        message: '已新增服務類別',
      })
      history.push('/service/categories')
    }).catch(error => {
      openSnackbar({
        variant: 'error',
        message: error.message,
      })
    })
  }

  const value = {
    register,
    errors,
  }

  useEffect(() => {
    if (!getAttribution.loading) {
      const data = idx(getAttribution, _ => _.data.getAttribution)
      setAttributions(data)
    }
  }, [getAttribution.loading])

  return (
    <Page css={styles.root} title="新增服務分類">
      <Container maxWidth="lg">
        <PageTitle title='新增服務分類' subTitle='New Service Category' />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Provider value={value}>
            <AboutServiceCategory attributions={attributions} className={styles.aboutServiceCategory} attr={attr} setAttr={setAttr} />
          </Provider>
          <div css={styles.actions}>
            <Button color="primary" variant="contained" type="submit" data-testid="submit">
              新增服務類別
            </Button>
          </div>
        </form>
      </Container>
    </Page>
  )
}

export default ServiceCategoryCreate
