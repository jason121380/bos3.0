/** @jsxImportSource @emotion/react */
import {
    Button, Card, CardActions, CardContent, CardHeader,
    Table, TableHead, TableRow, TableCell, TablePagination, Typography
} from '@mui/material'
import PropTypes from 'prop-types'
import { useRef, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { CSVLink } from "react-csv"
import pagenationLabel from './../helper/pagenationLabel'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
    card: css({
        borderRadius: '16px',
        boxShadow: 'none',
        border: '1px solid #f0f0f0',
        backgroundColor: '#fff',
        overflow: 'hidden',
    }),
    cardHeader: css({
        padding: '12px 24px !important',
        '& .MuiCardHeader-title': {
            fontSize: '15px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
        },
    }),
    content: css({
        padding: '0px !important',
    }),
    actions: css({
        padding: theme.spacing(0, 1),
        justifyContent: 'flex-end',
    }),
    csvBtn: css({
        borderRadius: '20px !important',
        padding: '6px 20px !important',
        fontSize: '14px !important',
        boxShadow: 'none !important',
        fontWeight: 'bold !important',
        backgroundColor: '#f5f5f5 !important',
        color: '#666 !important',
        '&:hover': {
            backgroundColor: '#eeeeee !important',
        }
    }),
}

const ManagementTable = ({
    title,
    totalCount,
    excelData,
    excelFilename,
    tableHead,
    children,
    pageLimit,
    pageOffset,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50, 100],
    minWidth = 1000,
    headerAction,
    className,
    hidePagination = false,
    size = 'medium',
}) => {
    const pageRef = useRef(null)

    useEffect(() => {
        if (pageRef.current && !hidePagination) {
            pagenationLabel(pageRef.current)
        }
    }, [children, pageRef.current, hidePagination])

    return (
        <Card className={className} css={styles.card}>
            <CardHeader
                css={styles.cardHeader}
                action={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {excelData && (
                            <CSVLink data={excelData} filename={excelFilename || "data.csv"}>
                                <Button variant="contained" css={styles.csvBtn} size="small">
                                    報表匯出
                                </Button>
                            </CSVLink>
                        )}
                        {headerAction}
                    </div>
                }
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>{title}</span>
                        <Typography color="textSecondary" variant="body2">
                            共 {totalCount} 筆
                        </Typography>
                    </div>
                }
            />
            <CardContent css={styles.content}>
                <PerfectScrollbar>
                    <div style={{ minWidth }}>
                        <Table size={size}>
                            <TableHead>
                                <TableRow>
                                    {tableHead}
                                </TableRow>
                            </TableHead>
                            {children}
                        </Table>
                    </div>
                </PerfectScrollbar>
            </CardContent>
            {!hidePagination && (
                <CardActions css={styles.actions}>
                    <TablePagination
                        ref={pageRef}
                        labelRowsPerPage='每頁顯示數量'
                        component="div"
                        count={totalCount}
                        onPageChange={onPageChange}
                        onRowsPerPageChange={onRowsPerPageChange}
                        page={pageOffset}
                        rowsPerPage={pageLimit}
                        rowsPerPageOptions={rowsPerPageOptions}
                        SelectProps={{
                            style: { width: '80px' }
                        }}
                    />
                </CardActions>
            )}
        </Card>
    )
}

ManagementTable.propTypes = {
    title: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired,
    excelData: PropTypes.array,
    excelFilename: PropTypes.string,
    tableHead: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    pageLimit: PropTypes.number.isRequired,
    pageOffset: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowsPerPageChange: PropTypes.func.isRequired,
    rowsPerPageOptions: PropTypes.array,
    minWidth: PropTypes.number,
    headerAction: PropTypes.node,
    className: PropTypes.any,
    hidePagination: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium']),
}

export default ManagementTable
