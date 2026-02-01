/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3),
  }),
  fieldGroup: css({
    display: 'flex',
    alignItems: 'center',
  }),
  fieldHint: css({
    margin: theme.spacing(1, 0),
  }),
  tags: css({
    marginTop: theme.spacing(1),
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  }),
  flexGrow: css({
    flexGrow: 1,
  }),
  dateField: css({
    '& + &': {
      marginLeft: theme.spacing(2),
    },
  }),
  field: css({
    width: "100%"
  }),
  serviceInputGroup: css({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  }),
}

function AboutEmployee({ className, employee, onChange, service, setEmployee, ...rest }) {
  return (
    <Card {...rest} css={className}>
      <CardHeader title="一般資訊" />
      <CardContent>
        <TextField
          label="姓氏"
          variant="outlined"
          fullWidth
          name="lastName"
          css={styles.formGroup}
          value={employee.lastName}
          onChange={event => onChange({ event, key: 'lastName' })}
        />
        <TextField
          label="名字"
          variant="outlined"
          fullWidth
          name="firstName"
          css={styles.formGroup}
          value={employee.firstName}
          onChange={event => onChange({ event, key: 'firstName' })}
        />
        <TextField
          label="手機號碼"
          variant="outlined"
          type="number"
          fullWidth
          name="cellphone"
          css={styles.formGroup}
          value={employee.cellphone}
          onChange={event => onChange({ event, key: 'cellphone' })}
          onWheel={() => document.activeElement.blur()}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <FormControl variant="outlined" css={styles.field}>
            <InputLabel>人員身分類別設定</InputLabel>
            <Select
              label='人員身分類別設定'
              value={employee.jobPointId}
              onChange={event => onChange({ event, key: 'jobPointId' })}
            >
              <MenuItem value='未設定' key={null}>
                未設定
              </MenuItem>
              {service.map((data, idx) => (
                <MenuItem value={data.id} key={`${data.jobTitle}-${idx}`}>
                  {data.jobTitle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </CardContent>
    </Card>
  )
}

AboutEmployee.propTypes = {
  css: PropTypes.object,
}

export default AboutEmployee
