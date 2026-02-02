/** @jsxImportSource @emotion/react */
import { Card, Button, IconButton, Link } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Link as RouterLink } from 'react-router-dom'
import PageTitle from './PageTitle'
import { css } from '@emotion/react'
import PropTypes from 'prop-types'

const styles = {
    headerCard: css({
        display: 'flex',
        padding: '12px 24px',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F0FE',
        borderRadius: '12px',
        boxShadow: 'none',
        border: 'none !important',
        marginBottom: '12px',
    }),
    leftSection: css({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    }),
    primaryButton: css({
        borderRadius: '20px !important',
        padding: '6px 20px !important',
        fontSize: '14px !important',
        boxShadow: 'none !important',
        fontWeight: 'bold !important',
        backgroundColor: '#FFFFFF !important',
        color: '#666 !important',
        '&:hover': {
            backgroundColor: '#f8f8f8 !important',
        }
    }),
}

const AdminPageHeader = ({
    title,
    subTitle,
    showFilter,
    onFilterClick,
    primaryAction,
    children
}) => {
    return (
        <Card css={styles.headerCard}>
            <div css={styles.leftSection}>
                <PageTitle title={title} subTitle={subTitle} style={{ color: '#1A73E8' }} />

                {primaryAction && (
                    primaryAction.to ? (
                        <Link component={RouterLink} to={primaryAction.to} style={{ textDecoration: 'none' }}>
                            <Button variant="contained" css={styles.primaryButton}>
                                {primaryAction.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="contained" css={styles.primaryButton} onClick={primaryAction.onClick}>
                            {primaryAction.label}
                        </Button>
                    )
                )}

                {onFilterClick && (
                    <IconButton
                        onClick={onFilterClick}
                        css={css({
                            backgroundColor: showFilter ? 'rgba(26, 115, 232, 0.1) !important' : 'transparent !important',
                            color: showFilter ? '#1A73E8 !important' : '#666 !important',
                            marginLeft: '4px !important',
                            '&:hover': {
                                backgroundColor: 'rgba(26, 115, 232, 0.15) !important',
                            }
                        })}
                    >
                        <FilterListIcon />
                    </IconButton>
                )}
            </div>

            {children}
        </Card>
    )
}

AdminPageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    showFilter: PropTypes.bool,
    onFilterClick: PropTypes.func,
    primaryAction: PropTypes.shape({
        label: PropTypes.string.isRequired,
        to: PropTypes.string,
        onClick: PropTypes.func,
    }),
    children: PropTypes.node,
}

export default AdminPageHeader
