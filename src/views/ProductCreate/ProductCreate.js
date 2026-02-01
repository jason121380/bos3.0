/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateProduct from 'hooks/useFetchCreateProduct'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import { useFetchGetisUnlimProdEmpPrice } from 'hooks/useFetchGetParameterAboutSettingFunction'
import { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { Provider } from 'hooks/useStore'
import idx from 'idx'

import AboutProduct from './AboutProduct'
import AboutSalesProduct from './AboutSalesProduct'
import styles from './styles/ProductCreate'

export default function ProductCreate() {
  const [forSale, setForSale] = useState(true)
  const [merchantVendor, setMerchantVendor] = useState([])
  const [vendorUUId, setVendorUUId] = useState(null)
  const form = useForm({
    defaultValues: {
      cost: 0,
      sellPrice: 0,
      employeePrice: 0,
      safeHigh: 0,
      safeLow: 0,
      stockUnit: '',
      no: '',
      name: '',
      ProductCategoryId: '',
      commissionWay: '',
      commission: 0,
      isAvailableForSale: true,
      isPublished: true,
      isLocked: 'UNSET',
    },
  })

  const { handleSubmit } = form
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const { createProduct } = useFetchCreateProduct()
  const merchantVendorList = useFetchGetMerchantVendorList()
  const getisUnlimProdEmpPrice = useFetchGetisUnlimProdEmpPrice()
  const history = useHistory()

  const isUnlimProdEmpPrice = useMemo(() => {
    if (!getisUnlimProdEmpPrice.loading && getisUnlimProdEmpPrice.data) {
      return getisUnlimProdEmpPrice.data.getParameterAboutSettingFunction.isUnlimProdEmpPrice
    }
    return false
  }, [getisUnlimProdEmpPrice.loading, getisUnlimProdEmpPrice.data])

  const onSubmit = async data => {
    if (!forSale) delete data.commissionWay
    data.VendorId = vendorUUId
    try {
      if (forSale && data.commissionWay === '') {
        openSnackbar({ message: '請選擇抽成方式', variant: 'warning' })
        return
      }
      if (!isUnlimProdEmpPrice && (data.employeePrice < data.cost)) throw new Error('自購價不可低於成本價')
        const res = await createProduct({
          input: {
            ...data,
            OfficialBrandMerchantId: merchantId,
          },
        })

        if (res.data.createProduct) {
          openSnackbar({ message: '成功新增商品', variant: 'success' })
          history.push('/products')
        } else {
          openSnackbar({ message: '新增商品失敗', variant: 'error' })
        }
      
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
    }
  }
  useEffect(() => {
    if (!merchantVendorList.loading) {
      const data = idx(merchantVendorList,_=>_.data.getMerchantVendorList)
      setMerchantVendor(data)
    }
  }, [merchantVendorList.loading])
  
  const value = form
  return (
    <Page css={styles.root} title="新增商品">
      <Container maxWidth="md">
        <Provider value={value}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <PageTitle title='新增商品' subTitle='Create Product' />
            <AboutProduct className={styles.aboutPayment} merchantVendor={merchantVendor} vendorUUId={vendorUUId} setVendorUUId={setVendorUUId} setForSale={setForSale} />
            {forSale && <AboutSalesProduct className={styles.aboutPayment} />}
            <div css={styles.actions}>
              <Button color="primary" variant="contained" type="submit" data-testid="submit">
                新增
              </Button>
            </div>
          </form>
        </Provider>
      </Container>
    </Page>
  )
}
