/** @jsxImportSource @emotion/react */
import { Grid } from '@mui/material'
import { Button } from 'ui/button'
import { Input } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
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
          <Card key={`${title}-${i}`}>
            <CardHeader>
              <CardTitle>{`${title}設定`}</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid container spacing={2}>
                {options.length ? options.map((data, index) => (
                  <Grid style={{ width: index === options.length - 1 ? 214 : '' }} item sm={4} css={styles.serviceInputGroup} key={index}>
                    <span
                      className="inline-block shrink-0 text-heading tabular-nums text-text"
                      style={{ margin: '0 5px', width: '25px' }}
                    >
                      {index + 1}
                    </span>
                    <Input
                      className="min-w-0 flex-1"
                      disabled={!inputEnable}
                      type="text"
                      value={data}
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
                    <span className="text-heading text-text">
                      無資料
                    </span>
                    <Button variant="ghost" size="icon" aria-label={`新增${title}`} disabled={!inputEnable} onClick={() => handleAddOption(key)} >
                      <AddIcon/>
                    </Button>
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