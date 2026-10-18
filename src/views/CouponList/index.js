/** @jsxImportSource @emotion/react */
import { Container, Button, CircularProgress, Grid, Collapse } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useFetchTicketsForList } from 'hooks/useFetchTickets'
import AdminPageHeader from 'components/AdminPageHeader'
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
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(6),
  }),
  results: css({
    marginTop: theme.spacing(1),
  }),
  categorieDiv: css({
    padding: '16px 20px',
    backgroundColor: 'rgb(var(--background))',
    borderRadius: '12px',
    border: '1px solid rgb(var(--border))',
    marginBottom: '16px',
    '& button': {
      lineHeight: '1.5'
    }
  }),
  categorieBtn: css({
    margin: '4px !important',
    borderRadius: '8px !important',
    border: '1px solid rgb(var(--border)) !important',
    color: 'rgb(var(--text-secondary)) !important',
  }),
  clickedCategorieBtn: css({
    margin: '4px !important',
    borderRadius: '8px !important',
    backgroundColor: 'rgb(var(--accent)) !important',
    color: 'white !important',
  }),
  categorieClear: css({
    margin: '4px !important',
    borderRadius: '8px !important',
    backgroundColor: red[500] + '!important',
    color: 'white !important',
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
  const [showFilter, setShowFilter] = useState(false)

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
        <AdminPageHeader
          title="預收卡設定"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={{
            label: '新增預收卡',
            to: '/coupon/create'
          }}
        />
        <Collapse in={showFilter}>
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
        </Collapse>
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
