/** @jsxImportSource @emotion/react */
// 人員身分下拉的值可能為空字串（尚未載入預設值），保留 MUI Select
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

function AboutEmployee({ className, employee, onChange, service, setEmployee, ...rest }) {
  return (
    <Card {...rest} css={className}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field label="姓氏" htmlFor="employee-create-lastName">
          <Input
            id="employee-create-lastName"
            name="lastName"
            value={employee.lastName}
            onChange={event => onChange({ event, key: 'lastName' })}
          />
        </Field>
        <Field label="名字" htmlFor="employee-create-firstName">
          <Input
            id="employee-create-firstName"
            name="firstName"
            value={employee.firstName}
            onChange={event => onChange({ event, key: 'firstName' })}
          />
        </Field>
        <Field label="手機號碼" htmlFor="employee-create-cellphone">
          <Input
            id="employee-create-cellphone"
            type="number"
            name="cellphone"
            value={employee.cellphone}
            onChange={event => onChange({ event, key: 'cellphone' })}
            onWheel={() => document.activeElement.blur()}
          />
        </Field>
        <div className="mt-2 flex justify-between">
          <FormControl variant="outlined" fullWidth>
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
