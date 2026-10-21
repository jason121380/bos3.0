// 抽成方式改 NativeSelect、抽成數字改 Field＋Input（標籤放欄位上方）
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

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
        <Field label="抽成方式">
          <NativeSelect
            value={product.commissionWay !== undefined && product.commissionWay}
            onChange={event => onChange({ event, key: 'commissionWay' })}
          >
            {commissionWay.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field
          label={
            product.commissionWay === 'byCost' || product.commissionWay === 'byPrice'
              ? '抽成數字%'
              : '抽成數字'
          }
        >
          <Input
            type="number"
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
        </Field>
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
                    value: cloneDeep(product.customerSellSetting).map(item => {
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
