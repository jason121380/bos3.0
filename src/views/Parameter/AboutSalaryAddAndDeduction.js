/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Grid,
  Typography,
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo, Fragment } from 'react'
import _ from 'lodash'

import styles from './styles/AboutSalaryAddAndDeduction'

function AboutSalaryAddAndDeduction({ className, service, onChange, inputEnable }) {
  const handleAddSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    switch (rest[0]) {
      case 'salaryIncreaseItem':
        newService.salaryIncreaseItem.push({ itemSetting: '', sorting: rest[1] + 1 })
        onChange({ changedData: newService.salaryIncreaseItem, key: 'salaryIncreaseItem' })
        break
      case 'salaryDecreaseItem':
        newService.salaryDecreaseItem.push({ itemSetting: '', sorting: rest[1] + 1 })
        onChange({ changedData: newService.salaryDecreaseItem, key: 'salaryDecreaseItem' })
        break
      default:
        break
    }
  }
  const handleDeleteSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    switch (rest[0]) {
      case 'salaryIncreaseItem':
        newService.salaryIncreaseItem.splice(rest[1], 1)
        onChange({ changedData: newService.salaryIncreaseItem, key: 'salaryIncreaseItem' })
        break
      case 'salaryDecreaseItem':
        newService.salaryDecreaseItem.splice(rest[1], 1)
        onChange({ changedData: newService.salaryDecreaseItem, key: 'salaryDecreaseItem' })
        break
      default:
        break
    }
  }

  const handleSalaryIncreaseName = (index, event) => {
    const newService = _.cloneDeep(service)
    newService.salaryIncreaseItem[index] = {
      ...newService.salaryIncreaseItem[index],
      itemSetting: event.target.value,
    }
    onChange({ changedData: newService.salaryIncreaseItem, key: 'salaryIncreaseItem' })
  }

  const handleSalaryDecreaseItemName = (index, event) => {
    const newService = _.cloneDeep(service)
    newService.salaryDecreaseItem[index] = {
      ...newService.salaryDecreaseItem[index],
      itemSetting: event.target.value,
    }
    onChange({ changedData: newService.salaryDecreaseItem, key: 'salaryDecreaseItem' })
  }
  return (
    <Fragment>
      <Card css={className}>
        <CardHeader title="薪資加項科目設定" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {service.salaryIncreaseItem.map((data, index) => (
              <Grid item css={styles.serviceInputGroup} key={index}>
                <Typography
                  variant="h5"
                  display="inline"
                  gutterBottom
                  style={{ margin: '0 5px', width: '25px' }}
                >
                  {data.sorting}
                </Typography>
                <TextField
                  disabled={!inputEnable}
                  type="text"
                  variant="outlined"
                  label="薪資加項科目設定"
                  value={data.itemSetting}
                  InputLabelProps={{ shrink: true }}
                  onChange={event => handleSalaryIncreaseName(index, event)}
                />
                <div style={{ display: 'flex' }}>
                  {service.salaryIncreaseItem.length > 1 && (
                    <DeleteForeverIcon
                      onClick={() =>
                        inputEnable && handleDeleteSetting('salaryIncreaseItem', index)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  {index === service.salaryIncreaseItem.length - 1 && (
                    <AddIcon
                      onClick={() =>
                        inputEnable && handleAddSetting('salaryIncreaseItem', data.sorting)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      <Card css={className}>
        <CardHeader title="薪資扣項科目設定" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {service.salaryDecreaseItem.map((data, index) => (
              <Grid item css={styles.serviceInputGroup} key={index}>
                <Typography
                  variant="h5"
                  display="inline"
                  gutterBottom
                  style={{ margin: '0 5px', width: '25px' }}
                >
                  {data.sorting}
                </Typography>
                <TextField
                  disabled={!inputEnable}
                  type="text"
                  variant="outlined"
                  label="薪資扣項科目設定"
                  value={data.itemSetting}
                  InputLabelProps={{ shrink: true }}
                  onChange={event => handleSalaryDecreaseItemName(index, event)}
                />
                <div style={{ display: 'flex' }}>
                  {service.salaryDecreaseItem.length > 1 && (
                    <DeleteForeverIcon
                      onClick={() =>
                        inputEnable && handleDeleteSetting('salaryDecreaseItem', index)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  {index === service.salaryDecreaseItem.length - 1 && (
                    <AddIcon
                      onClick={() =>
                        inputEnable && handleAddSetting('salaryDecreaseItem', data.sorting)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(AboutSalaryAddAndDeduction)
