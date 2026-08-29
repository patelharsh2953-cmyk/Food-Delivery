/**
 * Utility helper for building MongoDB search queries, filtering, and server-side pagination.
 * Enforces non-destructive soft-delete exclusion by default.
 */

export const buildQuery = (req, searchFields = [], filterFields = []) => {
    const {
        search,
        startDate,
        endDate,
        minPrice,
        maxPrice,
        includeDeleted,
        deletedOnly
    } = req.query;

    const query = {};

    // 1. Soft Delete Filtering
    if (deletedOnly === 'true' || deletedOnly === true) {
        query.isDeleted = true;
    } else if (includeDeleted !== 'true' && includeDeleted !== true) {
        // Exclude soft-deleted records by default
        query.isDeleted = { $ne: true };
    }

    // 2. Keyword Search (case-insensitive across specified fields)
    if (search && typeof search === 'string' && search.trim()) {
        const trimmedSearch = search.trim();
        const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escaped, 'i');

        if (searchFields.length > 0) {
            query.$or = searchFields.map(field => ({ [field]: searchRegex }));
        }
    }

    // 3. Exact/Categorical Field Filters
    filterFields.forEach(field => {
        const val = req.query[field];
        if (val !== undefined && val !== null && val !== '' && val !== 'All') {
            if (val === 'true' || val === 'false') {
                query[field] = val === 'true';
            } else if (!isNaN(Number(val)) && field.includes('Price')) {
                query[field] = Number(val);
            } else {
                query[field] = val;
            }
        }
    });

    // 4. Date Range Filters (e.g. createdAt, date)
    if (startDate || endDate) {
        const dateField = req.query.dateField || 'createdAt';
        query[dateField] = {};
        if (startDate) {
            query[dateField].$gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query[dateField].$lte = end;
        }
    }

    // 5. Numeric Range Filters (e.g. price, amount)
    if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
        const numField = req.query.numField || 'price';
        query[numField] = {};
        if (minPrice !== undefined && minPrice !== '') {
            query[numField].$gte = Number(minPrice);
        }
        if (maxPrice !== undefined && maxPrice !== '') {
            query[numField].$lte = Number(maxPrice);
        }
    }

    return query;
};

export const paginateQuery = async (model, query, req, sortOptions = { createdAt: -1 }, populateOptions = null) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || (req.query.paginate === 'true' ? 10 : 1000)));
    const skip = (page - 1) * limit;

    const isPaginationRequested = req.query.page !== undefined || req.query.limit !== undefined || req.query.paginate === 'true';

    const totalRecords = await model.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    let queryExec = model.find(query).sort(sortOptions);
    
    if (populateOptions) {
        queryExec = queryExec.populate(populateOptions);
    }

    if (isPaginationRequested) {
        queryExec = queryExec.skip(skip).limit(limit);
    }

    const data = await queryExec;

    return {
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalRecords,
            limit: isPaginationRequested ? limit : totalRecords,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
};
