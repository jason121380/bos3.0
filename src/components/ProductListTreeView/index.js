import { TextField } from 'ui/text-field'
import { useState, useEffect, Fragment } from 'react'
import { Button } from 'ui/button'
import useFetchProductTreeview from 'hooks/useFetchProductTreeview'
import ProductListModal from './ProductListModal'
import PropTypes from 'prop-types'
import idx from 'idx'
import { Autocomplete } from 'ui/combobox'

const ProductListTreeView = ({ onValueChange = () => { } }) => {
  const productTreeview = useFetchProductTreeview()
  const [products, setProducts] = useState({
    all: [],
    category: []
  })
  const [values, setValues] = useState([])
  const [open, setOpen] = useState(false)

  const handleSelectAll = () => {
    setValues(products.all)
  }

  const handleOnClick = ({ target }) => {
    // 正式輸入框沒有 MuiInputBase-root。圖示 path 或沒有 class 的節點冒泡時，getAttribute 為 null，不可 .includes。
    // 只在點到輸入框（或仍帶舊 class 的外框）時開窗；點外框內距、全選鈕、圖示維持不開。
    if (target.tagName === 'path') return
    const className = target.getAttribute('class') || ''
    if (target.tagName === 'INPUT' || className.includes('MuiInputBase-root')) setOpen(true)
  }

  useEffect(() => {
    const ids = values.map(d => d.id)
    onValueChange(ids)
  }, [values])

  useEffect(() => {
    if (!productTreeview.loading) {
      // 查詢失敗時 data 為 undefined：當成沒有商品，不讓整頁拋錯（Jason 2026/10/22 fix all）
      const data = idx(productTreeview, _ => _.data.productCategories) || []
      const allProducts = []
      data.forEach(({ products }) => {
        products.forEach(d => allProducts.push(d))
      })
      setProducts({
        all: allProducts,
        category: data
      })
    }
  }, [productTreeview])

  return (
    <Fragment>
      <div id='openModal' style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <Autocomplete
          className="min-w-0 flex-1 [&_input]:cursor-pointer"
          multiple
          fullWidth
          disabled={!products.all.length}
          open={false}
          style={{ cursor: 'pointer' }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          popupIcon={
            // 全選：比照店家挑選（MerchantListAutocpmplete）用 ui Button；popupIcon 外層可點，故以 asChild 落在 div 上避免巢狀 button，onClick 原樣
            <Button asChild variant="primary" size="sm" onClick={handleSelectAll}><div>全選</div></Button>
          }
          value={values}
          onChange={(e, v) => {
            setValues(v)
          }}
          options={products.all}
          disableCloseOnSelect
          getOptionLabel={option => option.name}
          renderOption={(props, option) => (
            <li {...props}>
              {option.name}
            </li>
          )}
          renderInput={params => (
            <TextField
              onClick={handleOnClick}
              {...params}
              focused={false}
              variant="outlined"
              label="加入商品"
              placeholder="商品名稱"
              onFocus={el => el.target.blur()}
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
        />
        <Button onClick={() => setOpen(true)} variant="primary" className="shrink-0">選擇商品</Button>
      </div>
      {!productTreeview.loading &&
        <ProductListModal
          open={open}
          setOpen={setOpen}
          productList={products}
          values={values}
          setValues={setValues}
        />
      }
    </Fragment>
  )
}

ProductListTreeView.propTypes = {
  onValueChange: PropTypes.func
}

export default ProductListTreeView