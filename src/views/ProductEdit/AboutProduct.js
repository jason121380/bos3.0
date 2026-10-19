import {
  FormControl, InputLabel, MenuItem, Select,
  TextField, Autocomplete
} from '@mui/material'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { Switch } from 'ui/switch'

const stockUnit = [
  { label: '個', value: '個' },
  { label: '支', value: '支' },
  { label: '捲', value: '捲' },
  { label: '桶', value: '桶' },
  { label: '包', value: '包' },
  { label: '兩', value: '兩' },
  { label: '片', value: '片' },
  { label: '盒', value: '盒' },
  { label: '條', value: '條' },
  { label: '組', value: '組' },
  { label: '瓶', value: '瓶' },
]

const lockStatus = [
  {
    value: 'TRUE',
    label: '不可更改',
  },
  {
    value: 'FALSE',
    label: '可更改',
  },
  {
    value: 'UNSET',
    label: '依系統參數設定',
  },
]

function AboutProduct({ className, product, onChange, setProduct, merchantVendor, ...rest }) {
  const productCategories = useFetchProductCategories()

  const handleForSaleSwitch = () => {
    setProduct({
      ...product,
      sellPrice: 0,
      commission: 0,
      isAvailableForSale: !product.isAvailableForSale,
    })
  }
  return (
    <Card {...rest} className={className}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6">
          <Field label="代號">
            <Input
              value={product.no}
              onChange={event => onChange({ event, key: 'no' })}
            />
          </Field>
          <Field label="名稱">
            <Input
              value={product.name}
              onChange={event => onChange({ event, key: 'name' })}
            />
          </Field>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>商品類別</InputLabel>
            <Select
              label='商品類別'
              value={product.ProductCategoryId}
              onChange={event => onChange({ event, key: 'ProductCategoryId' })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {idx(productCategories.data, _ =>
                _.productCategories.map((data, idx) => (
                  <MenuItem key={`${data.id}-${idx}`} value={data.id}>
                    {data.no} {data.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Autocomplete
            options={merchantVendor}
            autoHighlight
            value={product.VendorId}
            onChange={(e, value) => value === null ? setProduct({...product, VendorId: null}) : setProduct({...product, VendorId: value.uuid})}
            getOptionLabel={option => {
                if (typeof option === 'string') {
                  const optionLabel = merchantVendor.find(d => d.uuid === option)
                  if (option !== '' && optionLabel) {
                    return `${optionLabel.no === '' ? '(無代號)' : `${optionLabel.no}`} ${optionLabel.nickname === "" ? optionLabel.name : optionLabel.nickname}`
                  } else {
                    return ''
                  }
                } else {
                  return ''
                }
              }
            }
            renderOption={(props, option) => (
              <li {...props} key={option.uuid}>
                {`${option.no === '' ? '(無代號)' : `${option.no}`} ${option.nickname === "" ? option.name : option.nickname}`}
              </li>
            )}
            filterOptions={(options, {inputValue}) => {
              const newOptions = options.filter(d => {
                return (d.no.includes(inputValue) || d.name.includes(inputValue) || d.nickname.includes(inputValue))
              })
              return newOptions
            }}
            renderInput={params => (
              <TextField
                {...params}
                label="選擇廠商"
                variant="outlined"
                fullWidth
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password',
                }}
              />
            )}
          />
          <div className="flex flex-wrap gap-x-6">
            <div className="flex items-center text-body text-text">
              <span>是否可販售</span>
              <Switch
                checked={product.isAvailableForSale}
                onChange={handleForSaleSwitch}
                color="primary"
                name="isAvailableForSale"
              />
            </div>
            <div className="flex items-center text-body text-text">
              <span>是否上架</span>
              <Switch
                checked={product.isPublished}
                onChange={() => setProduct({...product, isPublished: !product.isPublished})}
                color="primary"
                name="isPublished"
              />
            </div>
          </div>
          {product.isAvailableForSale && (
            <TextField
              type="number"
              label="店販售價"
              variant="outlined"
              fullWidth
              value={product.sellPrice}
              onChange={event =>
                onChange({
                  event: {
                    target: {
                      value: Number(event.target.value),
                    },
                  },
                  key: 'sellPrice',
                })
              }
              onWheel={() => document.activeElement.blur()}              
            />
          )}
          <TextField
            type="number"
            label="成本價格"
            variant="outlined"
            fullWidth
            value={product.cost}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: Number(event.target.value),
                  },
                },
                key: 'cost',
              })
            }
            onWheel={() => document.activeElement.blur()}              
          />
          <TextField
            type="number"
            label="員工自購價格"
            variant="outlined"
            fullWidth
            value={product.employeePrice}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: Number(event.target.value),
                  },
                },
                key: 'employeePrice',
              })
            }
            onWheel={() => document.activeElement.blur()}              
          />
          <FormControl variant="outlined" fullWidth>
            <InputLabel>庫存單位</InputLabel>
            <Select
              label='庫存單位'
              value={product.stockUnit}
              onChange={event =>
                onChange({
                  event,
                  key: 'stockUnit',
                })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {stockUnit.map((data, idx) => (
                <MenuItem key={`${data.label}-${idx}`} value={data.value}>
                  {data.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>打帳單是否能更改預設價格</InputLabel>
            <Select
              label='打帳單是否能更改預設價格'
              name="isLocked"
              value={product.isLocked}
              onChange={event =>
                onChange({
                  event,
                  key: 'isLocked',
                })
              }
            >
              {lockStatus.map((data, idx) => (
                <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                  {data.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </CardContent>
    </Card>
  )
}

AboutProduct.propTypes = {
  className: PropTypes.object,
}

export default AboutProduct
