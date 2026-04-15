import api from './api.service';

export const getPerformanceReport = async () => {
    const response = await api.get('/reports/performance');
    return response.data;
};

export const getWillingReport = async (params) => {
    const response = await api.get('/reports/willing', { params });
    return response.data;
};

export const getWillingFilters = async () => {
    const response = await api.get('/reports/filters/willing');
    return response.data;
};


export const getPlacedReport = async (params) => {
    const response = await api.get('/reports/placed', { params });
    return response.data;
};


export const getCompanyWiseReport = async () => {
    const response = await api.get('/reports/company-wise');
    return response.data;
};

export const getPackageDistReport = async () => {
    const response = await api.get('/reports/package-dist');
    return response.data;
};
