/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateProductCategory from 'hooks/useFetchCreateProductCategory'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { Provider } from 'hooks/useStore'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutProductCategory from './AboutProductCategory'

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
  const { createProductCategory } = useFetchCreateProductCategory()
  const productCategories = useFetchProductCategories()
  const OfficialBrandMerchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  const { register, handleSubmit, errors } = useForm()
  const onSubmit = data => {
    createProductCategory({
      input: {
        ...data,
        OfficialBrandMerchantId,
      },
    }).then(() => {
      productCategories.refetch()
      history.push('/product/categories')
      openSnackbar({
        message: '成功新增商品類別',
        variant: 'success',
      })
    })
  }

  const value = {
    register,
    errors,
  }
  return (
    <Page css={styles.root} title="新增商品分類">
      <Container maxWidth="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <PageTitle title='新增商品分類' subTitle='Create Commodity Category' />
          <Provider value={value}>
            <AboutProductCategory className={styles.aboutPayment} />
          </Provider>
          <div css={styles.actions}>
            <Button color="primary" variant="contained" type="submit" data-testid="submit-create">
              新增
            </Button>
          </div>
        </form>
      </Container>
    </Page>
  )
}

export default ServiceCategoryCreate
