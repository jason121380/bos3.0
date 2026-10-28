import { useEffect, useState } from 'react'
import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { openSnackbar } from 'elements/snackbars'
import useFetchServiceCategory from 'hooks/useFetchServiceCategory'
import useFetchUpdateServiceCategory from 'hooks/useFetchUpdateServiceCategory'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { Provider } from 'hooks/useStore'
import useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import idx from 'idx'

import AboutServiceCategory from './AboutServiceCategory'
import QueryFailed from 'components/QueryFailed'

function ServiceCategoryEdit({ match }) {
  const hookForm = useForm()
  const { handleSubmit, setValue } = hookForm
  const [categoryId, setCategoryId] = useState('')
  const serviceCategoryDetail = useFetchServiceCategory({ categoryId: match.params.id })
  const { updateService } = useFetchUpdateServiceCategory()
  const history = useHistory()
  const [attributions, setAttributions] = useState([])
  const getAttribution = useFetchGetAttribution()

  useEffect(() => {
    if (!getAttribution.loading) {
      const data = idx(getAttribution, _ => _.data.getAttribution)
      setAttributions(data)
    }
  }, [getAttribution.loading])

  useEffect(() => {
    if (!serviceCategoryDetail.loading && serviceCategoryDetail.data) {
      setValue('no', serviceCategoryDetail.data.serviceCategory.no)
      setValue('name', serviceCategoryDetail.data.serviceCategory.name)

      setValue('remark', serviceCategoryDetail.data.serviceCategory.remark)

      setValue('attribution', serviceCategoryDetail.data.serviceCategory.attribution)

      setCategoryId(serviceCategoryDetail.data.serviceCategory.id)
    }
  }, [serviceCategoryDetail.loading, serviceCategoryDetail.data])

  const onSubmit = data => {
    const serviceCategory = { ...data, isUsing: true, itemId: categoryId }

    updateService(serviceCategory).then(() => {
      openSnackbar({ message: '更新成功', variant: 'success' })
      history.push('/service/categories')
    })
  }

  const value = hookForm

  return (
    <Page className="ui-root" title="編輯服務分類">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="編輯服務分類" />
        {serviceCategoryDetail.error ? (
          <QueryFailed onRetry={() => serviceCategoryDetail.refetch()} />
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Provider value={value}>
                {!serviceCategoryDetail.loading && !getAttribution.loading && (
                  <AboutServiceCategory attributions={attributions} />
                )}
              </Provider>
              <div className="mt-6 flex justify-end">
                <Button variant="primary" type="submit" data-testid="save">
                  儲存
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Page>
  )
}

export default ServiceCategoryEdit
