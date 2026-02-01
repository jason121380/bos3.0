/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import useFetchProductCategory from 'hooks/useFetchProductCategory'
import useFetchUpdateProductCategory from 'hooks/useFetchUpdateProductCategory'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Provider } from 'hooks/useStore'
import { useForm } from 'react-hook-form'

import AboutProductCategory from './AboutProductCategory'
import styles from './styles/ProductCategoryEdit'

function ServiceCategoryCreate({ match }) {
  const productCategoryDetail = useFetchProductCategory({ categoryId: match.params.id })
  const { updateProductCategory } = useFetchUpdateProductCategory()
  const productServices = useFetchProductCategories()
  const history = useHistory()

  const [categoryId, setCategoryId] = useState('')

  const { register, handleSubmit, errors, setValue } = useForm()

  useEffect(() => {
    if (!productCategoryDetail.loading) {
      setValue('no', productCategoryDetail.data.productCategory.no)
      setValue('name', productCategoryDetail.data.productCategory.name)

      setCategoryId(productCategoryDetail.data.productCategory.id)
    }
  }, [productCategoryDetail.data, productCategoryDetail.loading])

  const onSubmit = data => {
    updateProductCategory({
      input: {
        itemId: categoryId,
        ...data,
      },
    }).then(() => {
      productServices.refetch()
      history.push('/product/categories')
      openSnackbar({
        message: '成功更新商品類別',
        variant: 'success',
      })
    })
  }
  const value = { register, errors }
  return (
    <Page css={styles.root} title="編輯商品分類">
      <Container maxWidth="md">
        <PageTitle title='編輯商品分類' subTitle='Edit Commodity Category' />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Provider value={value}>
            {!productCategoryDetail.loading && (
              <AboutProductCategory className={styles.aboutPayment} />
            )}
          </Provider>
          <div css={styles.actions}>
            <Button color="primary" variant="contained" type="submit" data-testid="save">
              儲存
            </Button>
          </div>
        </form>
      </Container>
    </Page>
  )
}

export default ServiceCategoryCreate
