/** @jsxImportSource @emotion/react */
import { Button, Container, CircularProgress, ThemeProvider, createTheme } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import useFetchSetCreateInventory from 'hooks/useFetchSetCreateInventory'
import { useFetchGetProductInventory, useFetchGetProductInventoryLazy } from 'hooks/useFetchGetProductInventoryList'
import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import idx from 'idx'
import { cloneDeep } from 'lodash'
import sortData from 'helper/sortInventoryData'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  headerWrap: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10
  })
}

const theme2 = createTheme({
  palette: {
    secondary: {
      main: '#d36b00'
    }
  }
})

function InventoryWorkCreate() {
  const history = useHistory()
  const products = useFetchGetProductInventory({ input: {} })
  const productCategories = useFetchProductCategoriesInCreatePicking()
  const { createInventory } = useFetchSetCreateInventory()
  const [getProductInventory, productInventoryData] = useFetchGetProductInventoryLazy()
  const [inventoryData, setInventoryData] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [sort, setSort] = useState('inventory')

  useEffect(() => {
    if (!products.loading) {
      const productsData = idx(products, _ => _.data.productInventoryList)
      const data = productsData.map(({ productId, productNo, productName, count, productCategoryId }) => ({
        productId, productNo, productName, currentCount: count, productCategoryId, inventoryCount: count < 0 ? 0 : count
      }))
      setInventoryData(data)
    }
  }, [products.loading])

  useEffect(() => {
    const resData = sortData(inventoryData, sort)
    setInventoryData(resData)
  }, [sort])

  useEffect(() => {
    if (!productInventoryData.loading && productInventoryData.data) {
      const newData = cloneDeep(inventoryData)
      const productsData = idx(products, _ => _.data.productInventoryList)
      newData.forEach(({ productId }, index, arr) => {
        const findData = productsData.find(d => d.productId === productId)
        arr[index].currentCount = findData.count
      })
      setInventoryData(newData)
    }
  }, [productInventoryData.loading])

  const handleCreateIventory = async (isDraft = true) => {
    setIsClick(true)
    const data = cloneDeep(inventoryData)
    const inventoryDetails = []

    if (!isDraft) {
      const checkNull = data.some(({ inventoryCount }) => inventoryCount === null)
      if (checkNull) {
        checkNull && openSnackbar({
          variant: 'warning',
          message: '盤點數量不得為空'
        })
        setIsClick(false)
        return
      }
    }

    data.forEach(({ productNo, productName, productCategoryId, ...rest }) => {
      if (rest.inventoryCount !== null) inventoryDetails.push(rest)
    })

    try {
      const res = await createInventory({
        input: {
          date: new Date().getTime(),
          isDraft,
          inventoryDetails
        }
      })
      if (res.data.createInventory) {
        openSnackbar({
          variant: 'success',
          message: isDraft ? '儲存成功' : '新增成功'
        })
        history.push('/inventory-work')
      } else {
        setIsClick(false)
        openSnackbar({
          variant: 'warning',
          message: isDraft ? '儲存失敗' : '新增失敗'
        })
      }
    } catch (error) {
      setIsClick(false)
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    }
  }

  return (
    <Page css={styles.root} title="新增盤點">
      <Container maxWidth="md">
        <div css={styles.headerWrap}>
          <PageTitle title='新增盤點' subTitle='Inventory Work Create' />
          <ThemeProvider theme={theme2}>
            <Button
              onClick={() => getProductInventory()}
              color="secondary"
              variant="outlined"
              style={{ height: 'fit-content' }}
              disabled={productInventoryData.loading}
            >
              更新即時庫存
            </Button>
          </ThemeProvider>
        </div>
        {(products.loading || productCategories.loading) ?
          <div style={{ textAlign: 'center', marginTop: 150 }}>
            <CircularProgress />
          </div> :
          <General
            sort={sort}
            setSort={setSort}
            isClick={isClick}
            inventoryData={inventoryData}
            setInventoryData={setInventoryData}
            handleCreateIventory={handleCreateIventory}
            categoriesData={productCategories.data.productCategories}
          />
        }
      </Container>
    </Page>
  )
}

export default InventoryWorkCreate
