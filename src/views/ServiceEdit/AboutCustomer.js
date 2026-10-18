/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import idx from 'idx'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Field, Input } from 'ui/input'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3),
  }),
}

function AboutCustomer({ className, categories, onChange, ...rest }) {
  const handleOnchange = ({ event, category, key }) => {
    onChange({
      event: {
        target: {
          value: _.cloneDeep(categories).map(data => {
            if (data.category === category) data[key] = parseInt(idx(event, _ => _.target.value))
            return data
          }),
        },
      },
      key: 'customerSellSetting',
    })
  }
  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="客戶階級售價" />
      <CardContent>
        {categories.map((data, idx) => (
          <React.Fragment key={`${data.category}-${idx}`}>
            <Typography css={styles.formGroup} variant="h5" component="h5" gutterBottom>
              {data.category}
            </Typography>
            <Field label="折扣價(%)" className="mb-6">
              <Input
                type="number"
                value={data.percent}
                onChange={event =>
                  handleOnchange({ event, category: data.category, key: 'percent' })
                }
                onWheel={() => document.activeElement.blur()}
              />
            </Field>
            <Field label="生日價(%)" className="mb-6">
              <Input
                type="number"
                value={data.birthday}
                onChange={event =>
                  handleOnchange({ event, category: data.category, key: 'birthday' })
                }
                onWheel={() => document.activeElement.blur()}
              />
            </Field>
            {idx + 1 < categories.length ? <Divider css={styles.formGroup} /> : ''}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  )
}

AboutCustomer.propTypes = {
  className: PropTypes.object,
}

export default AboutCustomer
