/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Grid,
  Typography,
  IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { memo, Fragment } from 'react'
import { cloneDeep } from 'lodash'
import styles from './styles/AboutCustomerTracking'

const optionsArray = [
  { "hairProperties": '髮質屬性' },
  { "scalpProperties": '頭皮屬性' },
  { "permAppliance": '燙髮用具' },
  { "permPotion": '燙髮藥水' },
  { "hairColorCategory": '染髮類別' },
  { "hairColor": '染髮色系' }
]

function AboutCustomerTracking({ className, inputEnable, hairCondition, setHairCondition }) {
  const handleAddOption = key => {
    const conditions = cloneDeep(hairCondition)
    conditions[key].push('')
    setHairCondition(conditions)
  }

  const handleDeleteOption = (key, index) => {
    const conditions = cloneDeep(hairCondition)
    conditions[key].splice(index, 1)
    setHairCondition(conditions)
  }

  const handleInputOnChange = (event, key, index) => {
    const value = event.target.value
    const conditions = cloneDeep(hairCondition)
    conditions[key][index] = value
    setHairCondition(conditions)
  }
  return (
    <Fragment>
      {optionsArray.map((d, i) => {
        const [[key, title]] = Object.entries(d)
        const options = hairCondition[key]
        return (
          <Card css={className} key={`${title}-${i}`}>
            <CardHeader title={`${title}設定`} />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {options.length ? options.map((data, index) => (
                  <Grid style={{ width: index === options.length - 1 ? 214 : '' }} item sm={4} css={styles.serviceInputGroup} key={index}>
                    <Typography
                      variant="h5"
                      display="inline"
                      gutterBottom
                      style={{ margin: '0 5px', width: '25px' }}
                    >
                      {index + 1}
                    </Typography>
                    <TextField
                      disabled={!inputEnable}
                      type="text"
                      variant="outlined"
                      value={data}
                      InputLabelProps={{ shrink: true }}
                      onChange={event => handleInputOnChange(event, key, index)}
                    />
                    <div style={{ display: 'flex' }}>
                      {options.length >= 1 && (
                        <DeleteForeverIcon
                          disabled={!inputEnable}
                          onClick={() => handleDeleteOption(key, index)}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      {index === options.length - 1 && (
                        <AddIcon
                          disabled={!inputEnable}
                          onClick={() => handleAddOption(key)}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                    </div>
                  </Grid>
                )) : (
                  <Grid container direction="row" alignItems="center" style={{ gap: 20 }}>
                    <Typography component="h1" variant="h5">
                      無資料
                    </Typography>
                    <IconButton disabled={!inputEnable} onClick={() => handleAddOption(key)} >
                      <AddIcon/>
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )
      })}
    </Fragment>
  )
}

export default memo(AboutCustomerTracking)