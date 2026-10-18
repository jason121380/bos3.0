/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, TextField,
  Grid, Typography
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo } from 'react'
import { cloneDeep } from 'lodash'
import styles from './styles/AboutOrderSource'

function AboutOrderSource({ className, reference, setReference, inputEnable }) {
  const handleAddOption = () => {
    const data = cloneDeep(reference)
    data.push('')
    setReference(data)
  }

  const handleDeleteOption = index => {
    const data = cloneDeep(reference)
    data.splice(index, 1)
    setReference(data)
  }

  const handleInputOnChange = (event, index) => {
    const value = event.target.value
    const data = cloneDeep(reference)
    data[index] = value
    setReference(data)
  }

  return (
    <Card css={className}>
      <CardHeader title='訂單來源' />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          {reference.map((label, index) => (
            <Grid item css={styles.serviceInputGroup} key={index}>
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
                value={label}
                InputLabelProps={{ shrink: true }}
                onChange={event => handleInputOnChange(event, index)}
              />
              <div style={{ display: 'flex' }}>
                {reference.length >= 1 && (
                  <DeleteForeverIcon
                    disabled={!inputEnable}
                    onClick={() => handleDeleteOption(index)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {index === reference.length - 1 && (
                  <AddIcon
                    disabled={!inputEnable}
                    onClick={() => handleAddOption(index)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default memo(AboutOrderSource)