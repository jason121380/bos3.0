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
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { PaymentEnum } from 'helper/enum'
import idx from 'idx'
import PropTypes from 'prop-types'
import React from 'react'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  formControl: css({
    marginBottom: theme.spacing(3),
    width: '100%',
    '&:last-child': {
      marginBottom: 0,
    },
  }),
}

const deductions = [
  {
    label: '無扣項',
    value: 'none',
  },
  {
    label: '業績',
    value: 'onSales',
  },
  {
    label: '薪水',
    value: 'onSalary',
  },
]

function AboutProject({ className, payment, onChange, ...rest }) {
  const categoryLabel = React.useRef(null)

  return (
    <Card {...rest} css={className}>
      <CardHeader title="一般資訊" />
      <CardContent>
        <TextField
          css={styles.formControl}
          value={payment.name}
          label="名稱"
          variant="outlined"
          fullWidth
          inputProps={{
            'data-testid': 'name',
          }}
          onChange={event => onChange({ event, key: 'name' })}
        />
        <FormControl variant="outlined" css={styles.formControl}>
          <InputLabel ref={categoryLabel}>手續費類別</InputLabel>
          <Select
            label='手續費類別'
            value={payment.amountType}
            onChange={event =>
              onChange({
                event,
                key: 'amountType',
              })
            }
            data-testid="fee-category"
          >
            <MenuItem value="" disabled>
              <em>選擇手續費類別</em>
            </MenuItem>
            {Object.keys(PaymentEnum).map(key => (
              <MenuItem
                value={key}
                key={`payment-${key}`}
                data-testid={`fee-category-${PaymentEnum[key]}`}
              >
                {PaymentEnum[key]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          css={styles.formControl}
          type="text"
          value={payment.fee}
          label={`手續費${payment.amountType ? ' - ' + PaymentEnum[payment.amountType] : ''}`}
          variant="outlined"
          inputProps={{
            'data-testid': `fee-${PaymentEnum[payment.amountType]}`,
          }}
          onFocus={event => {
            idx(event, _ => _.target.select())
          }}
          onChange={event =>
            onChange({
              event: {
                target: {
                  value: payment.amountType === 'AMOUNT' ? Math.floor(idx(event, _ => _.target.value)) : idx(event, _ => _.target.value),
                },
              },
              key: 'fee',
            })
          }
          fullWidth
          onWheel={() => document.activeElement.blur()}
        />
        <FormControl variant="outlined" css={styles.formControl}>
          <InputLabel>手續費扣項方式</InputLabel>
          <Select
            label='手續費扣項方式'
            value={payment.type}
            onChange={event =>
              onChange({
                event,
                key: 'type',
              })
            }
            data-testid="payment-deductions"
          >
            <MenuItem value="" disabled>
              <em>選擇手續費扣項方式</em>
            </MenuItem>
            {deductions.map((data, idx) => (
              <MenuItem
                value={data.value}
                key={`payment-${data.value}-${data.label}`}
                data-testid={`payment-deduction-${data.label}`}
              >
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Checkbox color="primary" />}
          label="金額呈現為0"
          checked={payment.isNoCash}
          onChange={() => {
            onChange({
              event: {
                target: {
                  value: !payment.isNoCash,
                },
              },
              key: 'isNoCash',
            })
          }}
        />
      </CardContent>
    </Card>
  )
}

AboutProject.propTypes = {
  className: PropTypes.object,
}

export default AboutProject
