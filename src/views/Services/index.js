/** @jsxImportSource @emotion/react */
import { Container, Button, CircularProgress, Grid } from '@mui/material'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import PageTitle from 'components/PageTitle'
import useFetchServices from 'hooks/useFetchServices'
import idx from 'idx'
import produce from 'immer'
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
        <Grid style={{ marginBottom: 24 }} container item justifyContent='space-between' alignItems='center'>
          <PageTitle title='服務項目設定' subTitle='Services' />
          <Grid item>
            <Button
              style={{ backgroundColor: '#3865AC' }}
              color="primary"
              variant="contained"
              component={RouterLink}
              to="/service/create"
            >
              新增
            </Button>
          </Grid>
        </Grid>
        <SearchBar
          onSearch={event =>
            handlePageChange({
              key: 'keyword',
              value: event,
            })
          }
        />
        <div className="divText">點選服務類別進行篩選</div>
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
