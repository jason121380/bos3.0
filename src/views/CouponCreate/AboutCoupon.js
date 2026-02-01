/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3) + '!important',
  }),
  formGroup: css({
    marginBottom: theme.spacing(3) + '!important',
  }),
}

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
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="一般資訊" />
      <CardContent>
        <TextField
          value={coupon.no}
          label="代號"
          variant="outlined"
          fullWidth
          css={styles.formGroup}
          onChange={event => onChange({ event, key: 'no' })}
        />
        <TextField
          value={coupon.name}
          label="名稱"
          variant="outlined"
          fullWidth
          css={styles.formGroup}
          onChange={event => onChange({ event, key: 'name' })}
        />
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
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
          css={styles.formGroup}
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
          css={styles.formGroup}
        />
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
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
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
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
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
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
        <FormControl variant="outlined" fullWidth css={styles.formGroup}>
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
