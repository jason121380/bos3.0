import { TextField } from 'ui/text-field'
import { useFetchProductsInAutoComplete } from 'hooks/useFetchProducts'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useState, useEffect } from 'react'
import { Autocomplete } from 'ui/combobox'
import compareNo from 'utils/compareNo'

function ProductAutoComplete(
  {
    className = '',
    onChange = () => {},
    label = '',
    value,
    autoFocus,
    onFocus,
    onKeyDown,
    tabIndex,
    inputProps = {},
    setProductAlready,
    isPublished = false,
    getData,
  },
  ref
) {
  const product = useToggle()

  const [productKeyword, setProductKeyword] = useState('')
  const products = useFetchProductsInAutoComplete(isPublished ? { isAvailableForSale: true, isPublished: true } : { isAvailableForSale: true })

  useEffect(() => {
    if (setProductAlready !== undefined && !products.loading) {
      setProductAlready(!products.loading)
    }
  }, [products.loading, setProductAlready])
  const options = idx(products, _ => _.data.products.data) || []

  const selectedValue = idx(products, _ => _.data.products.data.find(d => d.id === value)) || null

  useEffect(() => {
    if (options.length > 0) getData && getData(options)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（getData）；只在 [options] 變動時呼叫，補上會每次 render 重跑
  }, [options])

  useEffect(() => {
    if (selectedValue?.no === productKeyword || selectedValue?.name.includes(productKeyword)) {
      setProductKeyword(selectedValue.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [selectedValue] 變動時執行；productKeyword 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [selectedValue])
  useEffect(() => {
    if (selectedValue === null && value === '') {
      setProductKeyword('')
    }
  }, [value, selectedValue])

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue.toLowerCase()
    // 代號自然排序（英數代號也有效）、空代號排最後（原本 a.no - b.no 對英數代號得 NaN、空代號當 0 排最前；Jason 2026/10/22 fix all）
    const filterOptions = [...options]
      .sort((a, b) => compareNo(a.no, b.no))
      .filter(d => {
        if (d.no && d.name) {
          const no = d.no.toLowerCase()
          const name = d.name.toLowerCase()
          return no.includes(keyWord) || name.includes(keyWord)
        }
        return false
      })
    return filterOptions
  }
  return (
    <Autocomplete
      freeSolo
      open={product.open}
      // inputValue={productKeyword}
      clearOnBlur={true}
      onOpen={product.toggle}
      onClose={product.toggle}
      className={className}
      value={selectedValue}
      options={options}
      autoHighlight
      filterOptions={filterOptions}
      getOptionLabel={option => (option.name ? option.name : option.no)}
      loading={products.loading}
      onChange={(_event, value) => onChange(idx(value, _ => value || { id: '' }))}
      renderOption={(props, option) => (
        <span {...props} data-testid={`${inputProps['data-testid']}-${option.name}`}>{`${
          option.no === null ? '無代號' : option.no
        } - ${option.name} - ${option.sellPrice}`}</span>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          fullWidth
          onChange={event => setProductKeyword(idx(event, _ => _.target.value))}
          variant="outlined"
          inputRef={ref}
          autoFocus={autoFocus}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          tabIndex={tabIndex}
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <React.Fragment>
                {/* {products.loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

export default React.forwardRef(ProductAutoComplete)
