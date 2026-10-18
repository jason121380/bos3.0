import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import useFetchProductCategory from 'hooks/useFetchProductCategory'
import useFetchUpdateProductCategory from 'hooks/useFetchUpdateProductCategory'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Provider } from 'hooks/useStore'
import { useForm } from 'react-hook-form'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutProductCategory from './AboutProductCategory'

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
    <Page className="ui-root" title="編輯商品分類">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="編輯商品分類" />
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Provider value={value}>
            {!productCategoryDetail.loading && (
              <AboutProductCategory />
            )}
          </Provider>
          <div className="flex justify-end">
            <Button variant="primary" type="submit" data-testid="save">
              儲存
            </Button>
          </div>
        </form>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
