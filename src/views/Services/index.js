/** @jsxImportSource @emotion/react */
import { Card, Container, Button, CircularProgress, Grid, IconButton, Collapse, Link } from '@mui/material'
import { FilterList as FilterListIcon } from 'ui/icons'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import PageTitle from 'components/PageTitle'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchServices from 'hooks/useFetchServices'
import idx from 'idx'
import produce from 'immer'
import React, { useState, useEffect } from 'react'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import { red } from '@mui/material/colors'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
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

function Services() {
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const [showFilter, setShowFilter] = useState(false)
  const [serviceCategories, setServiceCategories] = useState([])
  const [services, setServices] = useState()
  const [selectedCategorie, setSelectedCategorie] = useState([])

  const servicesData = useFetchServices(pageSetting)
  const serviceCategoriesData = useFetchServiceCategories()

  useEffect(() => {
    if (!serviceCategoriesData.loading && !servicesData.loading) {
      const services = idx(servicesData, _ => _.data.services)
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setServices(services)
      setServiceCategories(serviceCategories)
    }
  }, [serviceCategoriesData.loading, servicesData.loading])

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
  const handlePageChange = ({ value, key }) => {
    setPageSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }
  return (
    <Page css={styles.root} title="服務項目設定">
      <Container maxWidth={false}>
        <AdminPageHeader
          title="服務項目設定"
          sx={{ backgroundColor: 'transparent', mb: 0 }}
          primaryAction={{
            label: '新增',
            to: '/service/create'
          }}
          secondaryAction={
            <IconButton
              onClick={() => setShowFilter(!showFilter)}
              sx={{
                backgroundColor: showFilter ? 'rgba(26, 115, 232, 0.1) !important' : 'transparent !important',
                color: showFilter ? 'rgb(var(--accent)) !important' : 'rgb(var(--text-secondary)) !important',
                marginLeft: '4px !important',
                '&:hover': {
                  backgroundColor: 'rgba(26, 115, 232, 0.15) !important',
                }
              }}
            >
              <FilterListIcon />
            </IconButton>
          }
        />

        <Collapse in={showFilter}>
          <div style={{ marginBottom: '12px', backgroundColor: 'rgb(var(--background))', borderRadius: '8px', padding: '16px', border: '1px solid rgb(var(--border))' }}>
            <SearchBar
              onSearch={event =>
                handlePageChange({
                  key: 'keyword',
                  value: event,
                })
              }
            />
            <div style={{ marginTop: '12px' }}>
              <div className="divText" style={{ fontSize: '12px', color: 'rgb(var(--text-secondary))', marginBottom: '8px' }}>點選服務類別進行篩選</div>
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
            </div>
          </div>
        </Collapse>
        {!servicesData.loading ?
          services !== undefined && (
            <Results
              services={services}
              refetchService={servicesData.refetch}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          ) : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default Services
