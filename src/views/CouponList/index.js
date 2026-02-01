/** @jsxImportSource @emotion/react */
import { Container, Button, CircularProgress, Grid } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchTicketsForList } from 'hooks/useFetchTickets'
import idx from 'idx'
import { useState, useEffect } from 'react'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import { red } from '@mui/material/colors'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(2),
  }),
  categorieDiv: css({
    margin: '10px 0px',
    '& button': {
      lineHeight: '1.5'
    }
  }),
  categorieBtn: css({
    margin: '3px !important',
  }),
  clickedCategorieBtn: css({
    margin: '3px !important',
    color: 'white',
  }),
  categorieClear: css({
    backgroundColor: red[500] + '!important',
    color: 'white',
    '&:hover': {
      backgroundColor: red[700] + '!important',
    },
  }),
}

function CouponList() {
  const [pageSetting, setPageSetting] = useState({
    keyword: '',
    categoryIds: [],
  })

  const couponsData = useFetchTicketsForList(pageSetting)
  const [serviceCategories, setServiceCategories] = useState([])
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [coupons, setCoupons] = useState([])
  const serviceCategoriesData = useFetchServiceCategories()

  useEffect(() => {
    if (!serviceCategoriesData.loading) {
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setServiceCategories(serviceCategories)
    }
  }, [serviceCategoriesData.loading])

  useEffect(() => {
    if (!couponsData.loading) {
      setCoupons(idx(couponsData, _ => _.data.ticketsForList))
    }
  }, [couponsData.loading])

  const handleClickCategorie = categorieId => {
    setSelectedCategorie([categorieId])
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [categorieId],
      }
    })
  }

  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [],
      }
    })
  }

  return (
    <Page css={styles.root} title="卡券列表">
      <Container maxWidth={false}>
        <Grid container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='卡券列表' subTitle='Coupon' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/coupon/create"
            >
              新增卡券
            </Button>
          </Grid>
        </Grid>
        <div style={{ marginTop: 24 }}>點選卡券類別進行篩選</div>
        <div css={styles.categorieDiv}>
          {serviceCategories.map(serviceCategorie => (
            <Button
              variant={
                selectedCategorie.indexOf(serviceCategorie.id) !== -1 ? 'contained' : 'outlined'
              }
              color="primary"
              size="small"
              css={
                selectedCategorie.indexOf(serviceCategorie.id) !== -1
                  ? styles.clickedCategorieBtn
                  : styles.categorieBtn
              }
              onClick={() => handleClickCategorie(serviceCategorie.id, serviceCategorie.name)}
              key={serviceCategorie.id}
              style={
                selectedCategorie.indexOf(serviceCategorie.id) === -1 ? {} : { color: 'white' }
              }
            >
              {serviceCategorie.name}
            </Button>
          ))}
          <Button
            variant="contained"
            size="small"
            css={styles.categorieClear}
            onClick={handleClearCategorie}
          >
            清除
          </Button>
        </div>
        {!couponsData.loading ?
          <Results
            className={styles.results}
            refetch={couponsData.refetch}
            coupons={coupons}
          /> : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}

      </Container>
    </Page>
  )
}

export default CouponList
