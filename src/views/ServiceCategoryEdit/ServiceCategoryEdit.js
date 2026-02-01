/** @jsxImportSource @emotion/react */
import { useEffect, useState } from 'react'
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchServiceCategory from 'hooks/useFetchServiceCategory'
import useFetchUpdateServiceCategory from 'hooks/useFetchUpdateServiceCategory'
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
    <Page css={styles.root} title="編輯服務分類">
      <Container maxWidth="lg">
        <PageTitle title='編輯服務分類' subTitle='Edit Service Category' />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Provider value={value}>
            {!serviceCategoryDetail.loading && !getAttribution.loading && (
              <AboutServiceCategory attributions={attributions} className={styles.aboutServiceCategory} />
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

export default ServiceCategoryEdit
