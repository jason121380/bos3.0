import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateProductCategory from 'hooks/useFetchCreateProductCategory'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { Provider } from 'hooks/useStore'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutProductCategory from './AboutProductCategory'

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
    <Page className="ui-root" title="新增商品分類">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <PageHeader title="新增商品分類" className="pb-0" />
          <Provider value={value}>
            <AboutProductCategory />
          </Provider>
          <div className="flex justify-end">
            <Button variant="primary" type="submit" data-testid="submit-create">
              新增
            </Button>
          </div>
        </form>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
