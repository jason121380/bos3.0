// 欄位多為值可能為空字串或布林值的 MUI Select，為維持同一張卡片的標籤樣式一致，文字欄位也保留 MUI TextField（橋接主題已套新外觀）
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

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
const sellOption = [
  {
    value: 'USING',
    label: '使用時入業績',
  },
  {
    value: 'SELLING',
    label: '販賣時入業績',
  },
  {
    value: 'USINGSAVEDEDUCT',
    label: '使用時入業績（扣項依販賣時設定）',
  },
]
const handlingFeeSelect = [
  {
    value: 'SELLING',
    label: '販賣時整筆扣除',
  },
  {
    value: 'USING',
    label: '每次使用時扣除',
  },
]
function AboutService({ className, onChange, coupon, ...rest }) {
  const serviceCategories = useFetchServiceCategories()
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <TextField
          value={coupon.no}
          label="代號"
          variant="outlined"
          fullWidth
          onChange={event => onChange({ event, key: 'no' })}
        />
        <TextField
          value={coupon.name}
          label="名稱"
          variant="outlined"
          fullWidth
          onChange={event => onChange({ event, key: 'name' })}
        />
        <FormControl variant="outlined" fullWidth>
          <InputLabel>服務類別</InputLabel>
          <Select
            label='服務類別'
            value={coupon.ServiceCategoryId}
            onChange={event => onChange({ event, key: 'ServiceCategoryId' })}
          >
            <MenuItem value="" disabled>
              <em>選擇服務類別</em>
            </MenuItem>
            {idx(serviceCategories, _ =>
              _.data.serviceCategories.map((data, idx) => (
                <MenuItem value={data.id} key={`service-category-${idx}`}>
                  {data.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="價格"
          variant="outlined"
          fullWidth
          onChange={event =>
            onChange({
              event: {
                target: {
                  value: idx(event, _ => parseInt(_.target.value)),
                },
              },
              key: 'price',
            })
          }
          value={coupon.price}
        />
        <TextField
          type="number"
          label="次數"
          variant="outlined"
          fullWidth
          value={coupon.ticketAvailableCount}
          onChange={event =>
            onChange({
              event: {
                target: {
                  value: idx(event, _ => +_.target.value || 1),
                },
              },
              key: 'ticketAvailableCount',
            })
          }
        />
        <FormControl variant="outlined" fullWidth>
          <InputLabel>打帳單是否能更改預設價格</InputLabel>
          <Select
            label='打帳單是否能更改預設價格'
            value={coupon.isLocked}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
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
        <FormControl variant="outlined" fullWidth>
          <InputLabel>業績入帳模式</InputLabel>
          <Select
            label='業績入帳模式'
            value={coupon.performanceCalculationMode}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
                key: 'performanceCalculationMode',
              })
            }
          >
            {sellOption.map((data, idx) => (
              <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>手續費扣款模式</InputLabel>
          <Select
            label='手續費扣款模式'
            value={coupon.handlingFeeDecountMode}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
                key: 'handlingFeeDecountMode',
              })
            }
          >
            {handlingFeeSelect.map((data, idx) => (
              <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>卡券上架狀態設定</InputLabel>
          <Select
            label='卡券上架狀態設定'
            value={coupon.isLaunched}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: idx(event, _ => _.target.value),
                  },
                },
                key: 'isLaunched',
              })
            }
          >
            <MenuItem value={true}>上架</MenuItem>
            <MenuItem value={false}>下架</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

AboutService.propTypes = {
  className: PropTypes.object,
}

export default AboutService
