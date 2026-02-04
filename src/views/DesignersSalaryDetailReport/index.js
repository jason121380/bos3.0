/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react'
import { Container, CircularProgress, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import DateSelector from 'components/DateSelector'
import useFetchDesignersSalaryDetailReport from 'hooks/useFetchUserSalaryDetail'
import { useFetchGetUserSalaryDetailExceLazy } from 'hooks/useFetchGetUserSalaryDetailExcel'
import idx from 'idx'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '284px',
  }),
  exportBtn: css({
    float: 'right',
  }),
  formGroup: css({
    width: '10rem',
    marginLeft: theme.spacing(3),
  }),
  topDiv: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap'
  }),
}

const DesignersSalaryDetailReport = () => {
  const [date, setDate] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime(),
  })
  const designersSalaryDetailReportData = useFetchDesignersSalaryDetailReport({
    date: date.startDate,
  })
  const { getUserSalaryDetailExceLazy, getUserSalaryDetailExceLazyData } = useFetchGetUserSalaryDetailExceLazy()
  useEffect(() => {
    if (!getUserSalaryDetailExceLazyData.loading && getUserSalaryDetailExceLazyData.data !== undefined) {
      const url = idx(getUserSalaryDetailExceLazyData, _ => _.data.getUserSalaryDetailExcel)
      window.open(url)
    }
  }, [getUserSalaryDetailExceLazyData.loading])

  const handleExportExcel = () => {
    getUserSalaryDetailExceLazy({
      variables: {
        date: date.startDate,
      }
    })
  }

  return (
    <Page css={styles.root} className='DesignersSalaryDetailReport' title="薪資明細表">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader
          title="薪資明細表"
          secondaryActions={[
            {
              label: '報表匯出',
              onClick: handleExportExcel,
              disabled: getUserSalaryDetailExceLazyData.loading,
              className: "noprint"
            },
            {
              label: '列印',
              onClick: () => window.print(),
              className: "noprint"
            }
          ]}
        >
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate']}
            dateChange={value => setDate(value)}
            onlyStart
            inputFormat='yyyy/MM'
            pickerOption={{
              views: ['month', 'year']
            }}
          />
        </AdminPageHeader>
        {!designersSalaryDetailReportData.loading ? (
          idx(designersSalaryDetailReportData, _ => (
            <Results
              salaryDetailReport={_.data.getUserSalaryDetail}
              merchantSalaryIncreaseItems={_.data.getUserSalaryDetail.usingSalaryIncreaseItem}
              merchantSalaryDecreaseItems={_.data.getUserSalaryDetail.usingSalaryDecreaseItem}
              designersSalaryDetailReportDataLoading={designersSalaryDetailReportData.loading}
            />
          ))
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default DesignersSalaryDetailReport
