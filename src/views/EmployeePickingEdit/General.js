// 表單欄位以 inputRef 串接 Enter 跳下一欄（含 Autocomplete、DatePicker、Select），保留 MUI；只換卡片外框
import { Select, MenuItem, FormControl, InputLabel } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import { useFetchProductsInEmployeePickingEdit } from 'hooks/useFetchProducts'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import { DatePicker } from 'ui/date-picker'
import idx from 'idx'
import { useRef, useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Autocomplete } from 'ui/combobox'

// 原 emotion styles：formControl 的 marginBottom 24px !important；原 ':last:child' 是無效選擇器（整條規則被瀏覽器丟棄），
// datePicker 的 '& input.MuiInput-input' 在 ui/date-picker（不輸出 MuiInput-input）不命中，兩者皆為死碼不轉
const styles = {
  formControl: '!mb-[24px]',
}

export default function General({
  className,
  formState,
  changeHandler,
  productHandler,
  dateHandler,
  purpose
}) {
  const products = useFetchProductsInEmployeePickingEdit()
  const users = useFetchUsersForCreatePicking()
  const [focus, setFocus] = useState('')
  const productRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()
  const designerRef = useRef()
  const purposeRef = useRef()
  const remarkRef = useRef()

  const options = useMemo(() => {
    if (!products.loading) {
      const data = idx(products, _ => _.data.products.data)
      return data.filter(d => d.isPublished || d.name === formState.productName)
    }
    return []
  }, [products.loading, formState.productName])

  useEffect(() => {
    switch (focus) {
      case 'price':
        idx(priceRef, _ => _.current.focus())
        idx(priceRef, _ => _.current.select())
        break
      case 'product':
        idx(productRef, _ => _.current.focus())
        break
      case 'count':
        idx(countRef, _ => _.current.focus())
        idx(countRef, _ => _.current.select())
        break
      case 'purpose':
        idx(purposeRef, _ => _.current.focus())
        break
      case 'designer':
        idx(designerRef, _ => _.current.focus())
        break
      case 'remark':
        idx(remarkRef, _ => _.current.focus())
        break
      default:
        break
    }
  }, [focus])
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>領料資訊</CardTitle>
      </CardHeader>
      <CardContent>
        <DatePicker
          format='yyyy/MM/dd'
          label='日期'
          className={styles.formControl}
          value={idx(formState, _ => _.date)}
          localeText={{
            toolbarTitle: '選擇日期'
          }}
          slotProps={{
            toolbar: {
              toolbarFormat: 'yyyy年M月d日'
            },
            textField: {
              variant: 'standard',
              fullWidth: true
            }
          }}
          onChange={e => dateHandler(e)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('product')
            }
          }}
        />
        <Autocomplete
          id="prodcut-select"
          className={styles.formControl}
          options={options}
          autoHighlight
          getOptionLabel={() => (formState ? formState.productName : '')}
          value={formState ? formState.productName : ''}
          onFocus={() => setFocus('product')}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('price')
            }
          }}
          filterOptions={(options, state) => {
            const keyword = state.inputValue.toUpperCase()
            const filterOptions = options.filter(d => {
              if (d.no && d.name) {
                const no = d.no.toUpperCase()
                const name = d.name.toUpperCase()
                return no.includes(keyword) || name.includes(keyword)
              }
              return false
            })
            return filterOptions
          }}
          isOptionEqualToValue={(option) => option.name === formState.productName}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <span>{option.no}</span>
              {option.name}
            </li>
          )}
          onChange={(_, value) => productHandler(value)}
          renderInput={params => (
            <TextField
              {...params}
              inputRef={productRef}
              label="選擇商品"
              variant="outlined"
              fullWidth
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password',
              }}
            />
          )}
        />

        <TextField
          label="自購價"
          variant="outlined"
          fullWidth
          type="number"
          className={styles.formControl}
          onChange={e => changeHandler('price', parseInt(e.target.value, 10))}
          value={idx(formState, _ => _.price ? _.price : '')}
          onWheel={() => document.activeElement.blur()}
          inputRef={priceRef}
          onFocus={() => setFocus('price')}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('count')
            }
          }}
        />
        <TextField
          label="數量"
          variant="outlined"
          fullWidth
          type="number"
          className={styles.formControl}
          onChange={e => changeHandler('count', parseInt(+e.target.value, 10))}
          value={idx(formState, _ => _.count)}
          onWheel={() => document.activeElement.blur()}
          onFocus={() => setFocus('count')}
          inputRef={countRef}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('designer')
            }
          }}
        />
        <Autocomplete
          id="picker-select"
          className={styles.formControl}
          options={idx(users, _ => _.data.users.users) || []}
          autoHighlight
          getOptionLabel={option => (formState ? formState.PickerName : '')}
          value={formState ? formState.PickerName : ''}
          onFocus={() => setFocus('designer')}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('purpose')
            }
          }}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <span>{option.designerNo}</span>
              {option.name}
            </li>
          )}
          isOptionEqualToValue={(option) => {
            return option.id === formState.PickerId
          }}
          onChange={(e, value) => changeHandler('PickerId', value)}
          renderInput={params => (
            <TextField
              {...params}
              label="領料人"
              variant="outlined"
              fullWidth
              inputRef={designerRef}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password',
              }}
            />
          )}
        />
        <FormControl
          fullWidth
          focused={focus === 'purpose'}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('remark')
            }
          }}
          className={styles.formControl}
          variant="outlined"
        >
          <InputLabel>用途</InputLabel>
          <Select
            disabled={purpose.length === 0}
            inputRef={purposeRef}
            label='用途'
            value={idx(formState, _ => _.purpose)}
            onChange={e => {
              changeHandler('purpose', e.target.value)
              setFocus('remark')
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                setFocus('remark')
              }
            }}
          >
            {purpose.map(data => (
              <MenuItem key={data} value={data}>{data}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          multiline
          minRows="4"
          label="備註"
          variant="outlined"
          fullWidth
          className={styles.formControl}
          inputRef={remarkRef}
          onChange={event => changeHandler('remark', event.target.value)}
          value={idx(formState, _ => _.remark ? _.remark : '')}
        />
      </CardContent>
      <CardFooter className="justify-start text-body font-medium tabular-nums">合計：{formatNumber(idx(formState, _ => _.price * _.count))}</CardFooter>
    </Card>
  )
}
