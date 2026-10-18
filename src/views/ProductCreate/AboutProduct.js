import {
  FormControl, InputLabel, MenuItem,
  Select, TextField, Switch, Autocomplete, FormHelperText
} from '@mui/material'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import useStore from 'hooks/useStore'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

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

function AboutProduct({ className, setForSale, merchantVendor, setVendorUUId, vendorUUId, ...rest }) {
  const productCategories = useFetchProductCategories()
  const inputLabel = useRef()
  const { errors, register, setValue, clearErrors, trigger, watch } = useStore()
  const categories = idx(productCategories, _ => _.data.productCategories) || []
  const watchList = watch([
    'cost',
    'sellPrice',
    'employeePrice',
    'safeHigh',
    'safeLow',
    'isAvailableForSale',
    'isLocked',
  ])
  const handleSelectAllText = e => {
    e.target.select()
  }

  const forSale = watch('isAvailableForSale')

  useEffect(() => {
    setForSale(forSale)
  }, [forSale])

  useEffect(() => {
    register(
      {
        name: 'ProductCategoryId',
      },
      {
        required: '商品類別 為必填',
      }
    )
    register(
      { name: 'stockUnit' },
      {
        required: '庫存單位 為必填',
      }
    )
    register({ name: 'isLocked' })
  }, [register])

  return (
    <Card {...rest} className={className}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <TextField
          label="代號"
          variant="outlined"
          fullWidth
          name="no"
          error={!!errors.no}
          helperText={errors.no && errors.no.message}
          inputProps={{
            'data-testid': 'no',
            ref: register({
              // required: '代號 為必填',
            }),
          }}
        />
        <TextField
          label="名稱"
          variant="outlined"
          fullWidth
          name="name"
          error={!!errors.name}
          helperText={errors.name && errors.name.message}
          inputProps={{
            'data-testid': 'name',
            ref: register({
              required: '名稱 為必填',
            }),
          }}
        />
        <FormControl error={!!errors.ProductCategoryId} variant="outlined" fullWidth>
          <InputLabel ref={inputLabel}>商品類別</InputLabel>
          <Select
            label='商品類別'
            name="ProductCategoryId"
            defaultValue=""
            data-testid="btn"
            onChange={event => {
              setValue('ProductCategoryId', event.target.value)
              if (errors.ProductCategoryId) {
                clearErrors(['ProductCategoryId'])
              }
            }}
          >
            <MenuItem value="">None</MenuItem>
            {categories.map((data, idx) => (
              <MenuItem
                key={`${data.id}-${idx}`}
                value={data.id}
                data-testid={`ProductCategoryId-${data.name}`}
              >
                {data.no} {data.name}
              </MenuItem>
            ))}
          </Select>

          {errors.ProductCategoryId && (
            <FormHelperText data-testid="ProductCategoryId-helperText">
              {errors.ProductCategoryId.message}
            </FormHelperText>
          )}
        </FormControl>
        <Autocomplete
          options={merchantVendor}
          autoHighlight
          value={vendorUUId}
          onChange={(e, value) => value === null ? setVendorUUId(null) : setVendorUUId(value.uuid)}
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
            <Switch name="isAvailableForSale" defaultChecked inputRef={register} />
          </div>
          <div className="flex items-center text-body text-text">
            <span>是否上架</span>
            <Switch name="isPublished" defaultChecked inputRef={register} />
          </div>
        </div>
        {forSale && (
          <TextField
            type="number"
            label="店販售價"
            variant="outlined"
            fullWidth
            name="sellPrice"
            error={!!errors.sellPrice}
            onFocus={handleSelectAllText}
            inputProps={{
              'data-testid': 'sellPrice',
              ref: register(
                forSale
                  ? {
                      valueAsNumber: true,
                      min: {
                        value: watchList.cost,
                        message: '店販售價 必須至少等於「成本價格」',
                      },
                    }
                  : {}
              ),
            }}
            onChange={() => {
              trigger('sellPrice')
              if (errors.customerSellSetting && errors.customerSellSetting.length > 0) {
                clearErrors(['customerSellSetting'])
              }
            }}
            helperText={errors.sellPrice && errors.sellPrice.message}
            onWheel={() => document.activeElement.blur()}              
          />
        )}
        <TextField
          type="number"
          label="成本價格"
          variant="outlined"
          fullWidth
          name="cost"
          error={!!errors.cost}
          onFocus={handleSelectAllText}
          inputProps={{
            'data-testid': 'cost',
            ref: register({
              // required: '成本價格 為必填',
              valueAsNumber: true,
              min: {
                value: 0,
                message: '成本價格最低為0元',
              },
            }),
          }}
          helperText={errors.cost && errors.cost.message}
          onWheel={() => document.activeElement.blur()}              
        />
        <TextField
          type="number"
          label="員工自購價格"
          variant="outlined"
          fullWidth
          name="employeePrice"
          onFocus={handleSelectAllText}
          error={!!errors.employeePrice}
          inputProps={{
            'data-testid': 'employeePrice',
            ref: register({
              min: {
                value: 0,
                message: '「員工自購價格」最低為0元',
              },
              // required: '「員工自購價格」為必填',
              valueAsNumber: true,
            }),
          }}
          helperText={errors.employeePrice && errors.employeePrice.message}
          onWheel={() => document.activeElement.blur()}              
        />
        <FormControl
          variant="outlined"
          fullWidth
          error={!!errors.stockUnit}
        >
          <InputLabel ref={inputLabel}>庫存單位</InputLabel>
          <Select
            label='庫存單位'
            name="stockUnit"
            error={!!errors.stockUnit}
            defaultValue=""
            inputProps={{
              'data-testid': 'stockUnit',
            }}
            onChange={event => {
              setValue('stockUnit', event.target.value)
              if (errors.stockUnit) {
                clearErrors(['stockUnit'])
              }
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {stockUnit.map((data, idx) => (
              <MenuItem
                key={`${data.label}-${idx}`}
                value={data.value}
                data-testid={`stockUnit-${data.label}`}
              >
                {data.label}
              </MenuItem>
            ))}
          </Select>

          {errors.stockUnit && (
            <FormHelperText data-testid="stockUnit-helpertext">
              {errors.stockUnit.message}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl variant="outlined" fullWidth>
          <InputLabel ref={inputLabel}>打帳單是否能更改預設價格</InputLabel>
          <Select
            label='打帳單是否能更改預設價格'
            defaultValue=""
            name="isLocked"
            onChange={event => {
              setValue('isLocked', event.target.value)
            }}
            value={watchList.isLocked}
          >
            {lockStatus.map((data, idx) => (
              <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

AboutProduct.propTypes = {
  className: PropTypes.object,
}

export default AboutProduct
