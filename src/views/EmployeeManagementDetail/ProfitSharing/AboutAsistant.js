/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3),
  }),
}

const deductions = [
  {
    label: '依設計師',
    value: 'onDesigner',
  },
  {
    label: '扣業績',
    value: 'onSales',
  },
  {
    label: '扣薪水',
    value: 'onSalary',
  },
  {
    label: '不扣',
    value: 'none',
  },
]

function AboutAsistant({ className, helperDeductionWay, onChange, ...rest }) {
  const inputLabel = useRef()
  const handleChange = event => {
    idx(event, _ => {
      onChange({
        key: 'helperDeductionWay',
        value: _.target.value,
      })
    })
  }
  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader>
        <CardTitle>助理</CardTitle>
      </CardHeader>
      <CardContent>
        <FormControl variant="outlined" css={styles.formGroup} fullWidth>
          <InputLabel ref={inputLabel}>扣項方式</InputLabel>
          <Select label='扣項方式' value={helperDeductionWay} onChange={handleChange}>
            {deductions.map(data => (
              <MenuItem value={data.value} key={data.value}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

AboutAsistant.propTypes = {
  className: PropTypes.object,
}

export default AboutAsistant
