import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

const commissionWay = [
  { label: '固定金額', value: 'fixed' },
  { label: '依售價-成本(%)', value: 'byCost' },
  { label: '售價(%)', value: 'byPrice' },
]
function AboutSalesCommission({ className, product, onChange, ...rest }) {
  return (
    <Card {...rest} className={className}>
      <CardHeader>
        <CardTitle>抽成</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <FormControl variant="outlined" fullWidth>
          <InputLabel>抽成方式</InputLabel>
          <Select
            label='抽成方式'
            value={product.commissionWay !== undefined && product.commissionWay}
            onChange={event => onChange({ event, key: 'commissionWay' })}
          >
            {commissionWay.map((data, idx) => (
              <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="number"
          label={
            product.commissionWay === 'byCost' || product.commissionWay === 'byPrice'
              ? '抽成數字%'
              : '抽成數字'
          }
          variant="outlined"
          fullWidth
          value={product.commission}
          onChange={event =>
            onChange({
              event: {
                target: {
                  value: Number(event.target.value),
                },
              },
              key: 'commission',
            })
          }
          onWheel={() => document.activeElement.blur()}              
        />
        {/* <Typography variant="h5" component="h5" css={styles.formGroup}>
          售價
        </Typography>
        <Divider css={styles.formGroup} />
        {product.customerSellSetting.map((data, index) => (
          <TextField
            css={styles.formGroup}
            type="number"
            key={`${data.category}-${index}`}
            label={data.category}
            value={data.price}
            onChange={event =>
              onChange({
                event: {
                  target: {
                    value: _.cloneDeep(product.customerSellSetting).map(item => {
                      item.price =
                        item.category === data.category
                          ? idx(event, _ => Number(_.target.value))
                          : item.price
                      return item
                    }),
                  },
                },
                key: 'customerSellSetting',
              })
            }
            variant="outlined"
            fullWidth
          />
        ))} */}
      </CardContent>
    </Card>
  )
}

AboutSalesCommission.propTypes = {
  className: PropTypes.object,
}

export default AboutSalesCommission
