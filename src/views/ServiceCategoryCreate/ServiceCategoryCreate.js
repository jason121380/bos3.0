import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchServiceCategoryCreate from 'hooks/useFetchServiceCategoryCreate'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { Provider } from 'hooks/useStore'
import useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import idx from 'idx'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutServiceCategory from './AboutServiceCategory'

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
      // 錯誤提示由 init-apollo 的 errorLink 統一處理，頁面不再重複 openSnackbar
    })
  }

  const value = {
    register,
    errors,
  }

  useEffect(() => {
    if (!getAttribution.loading) {
      const data = idx(getAttribution, _ => _.data.getAttribution)
      // 屬性查詢失敗時維持空清單，下拉不拋錯（2026/10/30 自動掃描發現）
      setAttributions(data || [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAttribution.loading])

  return (
    <Page className="ui-root" title="新增服務分類">
      {/* 頁面外距由 #printContainer 提供；表單頁內容寬度 max-w-3xl */}
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader className="pb-0" title='新增服務分類' />
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <Provider value={value}>
            <AboutServiceCategory attributions={attributions} attr={attr} setAttr={setAttr} />
          </Provider>
          <div>
            <Button variant="primary" type="submit" data-testid="submit">
              新增服務類別
            </Button>
          </div>
        </form>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
