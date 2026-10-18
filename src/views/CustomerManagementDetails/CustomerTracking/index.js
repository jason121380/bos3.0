/** @jsxImportSource @emotion/react */
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Button
} from '@mui/material'
import { Edit as EditIcon } from 'ui/icons'
import { useState, Fragment } from 'react'
import TrackingEditModal from './TrackingEditModal'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({
    '& td': {
      padding: '2px 5px',
    },
    '& .MuiInput-underline:before': {
      display: 'none'
    },
    '& .MuiInput-underline:after': {
      display: 'none'
    },
    '& .MuiInputBase-multiline': {
      padding: 0
    },
    '& fieldset': {
      border: 'none'
    },
    '& textarea': {
      padding: '0px !important'
    }
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
}

const optionsArray = [
  { "hairProperties": '髮質屬性' },
  { "scalpProperties": '頭皮屬性' },
  { "permAppliance": '燙髮用具' },
  { "permPotion": '燙髮藥水' },
  { "hairColorCategory": '染髮類別' },
  { "hairColor": '染髮色系' }
]

export default function index({ customerId, className, hairCondition, refetchHairInfo, isLoading, ...rest }) {
  const [open, setOpen] = useState(false)

  const handleOpenModel = () => {
    setOpen(true)
  }
  const handleRenderOptions = data => {
    if (!data.length) return ''
    return data.join('、')
  }

  return (
    <Fragment>
      <Grid {...rest} css={styles.root} container>
        <Grid item md={6} xs={12}>
          <Card>
            <CardHeader title='髮型狀況' />
            <Divider />
            <CardContent style={{ padding: 0 }} >
              <Table style={{ borderCollapse: 'collapse' }}>
                <TableBody>
                  {optionsArray.map((d, i) => {
                    const [[key, title]] = Object.entries(d)
                    const options = hairCondition[key]
                    return (
                      <TableRow key={`${title}-${i}`} hover>
                        <TableCell style={{ whiteSpace: 'nowrap' }}>{`${title}：`}</TableCell>
                        <TableCell>{handleRenderOptions(options)}</TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow hover>
                    <TableCell style={{ whiteSpace: 'nowrap' }}>染髮配方：</TableCell>
                    <TableCell>
                      <TextField
                        multiline
                        fullWidth
                        value={hairCondition.hairDyeFormula}
                        inputProps={{
                          readOnly: true
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardActions>
              <Button style={{ color: 'black' }} onClick={handleOpenModel}>
                <EditIcon />
                編輯
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      <TrackingEditModal
        customerId={customerId}
        open={open}
        setOpen={setOpen}
        optionsArray={optionsArray}
        hairCondition={hairCondition}
        refetchHairInfo={refetchHairInfo}
        isLoading={isLoading}
      />
    </Fragment>
  )
}
