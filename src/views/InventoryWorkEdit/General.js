/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, TextField,
  Divider, Button, ThemeProvider, createTheme,
  TableContainer, Table, TableBody, TableRow, TableCell,
  TableHead, Paper, Typography
} from '@mui/material'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Fragment, useState } from 'react'
import { cloneDeep } from 'lodash'
import { green, red } from '@mui/material/colors'
import format from 'date-fns/format'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: theme.spacing(3),
    whiteSpace: 'nowrap',
    '& .MuiCardHeader-content > span': {
      display: 'flex',
      width: '100%'
    }
  }),
  buttonGroup: css({
    gap: 10,
    display: 'flex',
    flexWrap: 'wrap',
  }),
  hearderWrap: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 10
  }),
  actions: css({
    marginTop: theme.spacing(3),
    gap: 10,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }),
  category: css({
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20
  }),
  categoryBtnWrap: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 10px'
  }),
  categoryBtn: css({
    whiteSpace: 'nowrap',
    flexWrap: 1
  }),
  divider: css({
    margin: '12px 0 -12px 0 !important',
    position: 'relative !important'
  }),
  plus: css({
    fontWeight: 'bold',
    color: '#3b3bff'
  }),
  minus: css({
    fontWeight: 'bold',
    color: 'red'
  }),
  info: css({
    fontSize: 12,
    fontWeight: 'normal',
    whiteSpace: 'break-spaces'
  }),
  infoWrap: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px 10px',
    flexWrap: 'wrap'
  })
}

const theme2 = createTheme({
  palette: {
    primary: {
      main: 'rgb(67, 160, 71) !important'
    },
    secondary: {
      main: red[600]
    }
  }
})

function General({
  info, isClick, inventoryData, setInventoryData, categoriesData,
  handleCreateIventory, sort, setSort
}) {
  const [categorys, setCategorys] = useState([])

  const handleSecectVariant = id => {
    return categorys.includes(id) ? 'contained' : 'outlined'
  }

  const handleClickCategory = id => {
    const index = categorys.indexOf(id)
    const cloneData = cloneDeep(categorys)
    if (index === -1) {
      cloneData.push(id)
    } else {
      cloneData.splice(index, 1)
    }
    setCategorys(cloneData)
  }

  const handleCheckCount = count => {
    if (count === 0) {
      return 0
    } else if (count > 0) {
      return <span css={styles.plus}>{`+${count}`}</span>
    } else {
      return <span css={styles.minus}>{count}</span>
    }
  }

  const handleCheckRenderItrm = categoryId => {
    if (!categorys.length) return true
    return categorys.includes(categoryId)
  }

  const Buttons = ({ sortDisplay = false }) => (
    <Fragment>
      {sortDisplay &&
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>排序：</span>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={sort}
            onChange={(e, value) => value && setSort(value)}
          >
            <ToggleButton value='inventory'>庫存</ToggleButton>
            <ToggleButton value='no'>代號</ToggleButton>
            <ToggleButton value='count'>差異</ToggleButton>
          </ToggleButtonGroup>
        </div>
      }
      <Button disabled={isClick} onClick={() => handleCreateIventory()} color="primary" variant="outlined">
        儲存盤點
      </Button>
      <ThemeProvider theme={theme2}>
        <Button disabled={isClick} onClick={() => handleCreateIventory(false)} color="secondary" variant="contained">
          完成盤點
        </Button>
      </ThemeProvider>
    </Fragment>
  )

  return (
    <Fragment>
      <Card css={styles.root}>
        <CardHeader title={
          <div css={styles.hearderWrap}>
            <div css={styles.infoWrap}>
              盤點列表
              {info !== null && (
                <div css={styles.infoWrap} style={{ alignSelf: 'flex-end' }}>
                  <Typography css={styles.info}>
                    {`建立時間:${format(info.date, 'yyyy/M/d HH:mm')}`}
                  </Typography>
                  <Typography css={styles.info}>
                    {`建立者:${info.creatorName}`}
                  </Typography>
                </div>
              )}
            </div>
            <div css={styles.buttonGroup}>
              <Buttons sortDisplay />
            </div>
          </div>
        } style={{ paddingBottom: '0' }} />
        <Divider css={styles.divider} />
        <CardContent>
          <div css={styles.category}>
            <ThemeProvider theme={theme2}>
              <div css={styles.categoryBtnWrap}>
                {categoriesData.map(({ id, name }) => (
                  <Button
                    key={id}
                    onClick={() => handleClickCategory(id)}
                    color="primary"
                    variant={handleSecectVariant(id)}
                    css={styles.categoryBtn}
                  >
                    {name}
                  </Button>
                ))}
              </div>
              <div>
                <Button onClick={() => setCategorys([])} color="primary" variant="contained">
                  清除篩選
                </Button>
              </div>
            </ThemeProvider>
          </div>
          <Typography style={{ marginTop: 12 }} color="textSecondary" variant="body2"></Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>商品名稱</TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>當前庫存</TableCell>
                  <TableCell>盤點數量</TableCell>
                  <TableCell>差異</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.map(({ productId, productName, productNo, currentCount, inventoryCount, productCategoryId }, index) => {
                  if (handleCheckRenderItrm(productCategoryId)) {
                    return (
                      <TableRow key={productId}>
                        <TableCell>{productName}</TableCell>
                        <TableCell>{productNo}</TableCell>
                        <TableCell>{currentCount}</TableCell>
                        <TableCell>
                          <TextField
                            style={{ width: 100 }}
                            value={inventoryCount === null ? '' : inventoryCount}
                            placeholder=''
                            variant='outlined'
                            onChange={e => {
                              const newData = cloneDeep(inventoryData)
                              if (
                                e.target.value.match(/^[0-9]*$/) === null ||
                                e.target.value.match(/^[0-9]*$/)[0] === ''
                              ) {
                                newData[index].inventoryCount = null
                              } else {
                                newData[index].inventoryCount = Number(e.target.value)
                              }
                              setInventoryData(newData)
                            }}
                            inputProps={{
                              min: 0,
                            }}
                            onWheel={() => document.activeElement.blur()}
                          />
                        </TableCell>
                        <TableCell>{inventoryCount === null ? '' : handleCheckCount(inventoryCount - currentCount)}</TableCell>
                      </TableRow>
                    )
                  }
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <div css={styles.actions}>
        <Buttons />
      </div>
    </Fragment>
  )
}
export default General