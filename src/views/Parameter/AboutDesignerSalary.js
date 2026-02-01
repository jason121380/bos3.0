/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, Divider, TextField } from '@mui/material'
import { Fragment } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import _ from 'lodash'

import styles from './styles/AboutDesignerSalary'

export default function AboutDesignerSalary({ className, onChange, service, inputEnable }) {
  const handleAddSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    switch (rest[0]) {
      case 'point':
        newService.point.push({ jobTitle: '', pointValue: 0 })
        onChange({ changedData: newService.point, key: 'point' })
        break
      case 'helperTypeName':
        newService.helperTypeName.push({})
        onChange({ changedData: newService.helperTypeName, key: 'helperTypeName' })
        break
      default:
        break
    }
  }

  const handleDeleteSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    switch (rest[0]) {
      case 'point':
        newService.point.splice(rest[1], 1)
        onChange({ changedData: newService.point, key: 'point' })
        break
      case 'helperTypeName':
        newService.helperTypeName.splice(rest[1], 1)
        onChange({ changedData: newService.helperTypeName, key: 'helperTypeName' })
        break
      default:
        break
    }
  }

  const handlePointSetting = (event, index) => {
    const newService = _.cloneDeep(service)
    switch (event.target.name) {
      case 'jobTitle':
        newService.point[index].jobTitle = event.target.value
        onChange({ changedData: newService.point, key: 'point' })
        break
      case 'pointValue':
        newService.point[index].pointValue = parseInt(event.target.value)
        onChange({ changedData: newService.point, key: 'point' })
        break
      default:
        break
    }
  }

  const handleHelperTypeName = (event, index) => {
    const newService = _.cloneDeep(service)
    newService.helperTypeName[index].type = event.target.value
    onChange({ changedData: newService.helperTypeName, key: 'helperTypeName' })
  }

  return (
    <Fragment>
      <Card css={className}>
        <CardHeader title="互助點數設定" />
        <Divider />
        <CardContent>
          {service.point.map((data, index) => (
            <div css={styles.service} key={index}>
              <TextField
                disabled={!inputEnable}
                type="text"
                variant="outlined"
                label="人員類別"
                name="jobTitle"
                value={data.jobTitle}
                onChange={event => handlePointSetting(event, index)}
              />
              <TextField
                disabled={!inputEnable}
                type="number"
                css={styles.point}
                variant="outlined"
                label="點數換算金額"
                name="pointValue"
                value={data.pointValue}
                onChange={event => handlePointSetting(event, index)}
                onWheel={() => document.activeElement.blur()}              
              />
              {service.point.length > 1 && (
                <DeleteForeverIcon
                  css={styles.action}
                  onClick={() => inputEnable && handleDeleteSetting('point', index)}
                />
              )}
              {index === service.point.length - 1 && (
                <AddIcon
                  css={styles.action}
                  onClick={() => inputEnable && handleAddSetting('point')}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card css={className}>
        <CardHeader title="互助類別名稱設定" />
        <Divider />
        <CardContent>
          {service.helperTypeName.map((data, index) => (
            <div css={styles.service} key={index}>
              <TextField
                disabled={!inputEnable}
                type="text"
                variant="outlined"
                label="互助類別"
                value={data.type}
                onChange={event => handleHelperTypeName(event, index)}
              />
              {service.helperTypeName.length > 1 && (
                <DeleteForeverIcon
                  css={styles.action}
                  onClick={() => inputEnable && handleDeleteSetting('helperTypeName', index)}
                />
              )}
              {index === service.helperTypeName.length - 1 && (
                <AddIcon
                  css={styles.action}
                  onClick={() => inputEnable && handleAddSetting('helperTypeName')}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </Fragment>
  )
}
