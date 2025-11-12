// Transaction History API
// Get user's recharge transaction history

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed. Use GET.'
        });
    }

    return handleGetTransactions(req, res);
}

function handleGetTransactions(req, res) {
    try {
        const { userId, limit = 10, offset = 0, type, network, status } = req.query;

        // Validate parameters
        const limitNum = Math.min(parseInt(limit) || 10, 100); // Max 100 records
        const offsetNum = Math.max(parseInt(offset) || 0, 0);

        // In production, you'd query a database
        // For now, return mock data
        const mockTransactions = generateMockTransactions();

        // Apply filters
        let filteredTransactions = mockTransactions;

        if (type && ['airtime', 'data'].includes(type)) {
            filteredTransactions = filteredTransactions.filter(t => t.type === type);
        }

        if (network) {
            filteredTransactions = filteredTransactions.filter(t => 
                t.network.toLowerCase() === network.toLowerCase()
            );
        }

        if (status) {
            filteredTransactions = filteredTransactions.filter(t => t.status === status);
        }

        // Apply pagination
        const paginatedTransactions = filteredTransactions
            .slice(offsetNum, offsetNum + limitNum);

        // Calculate totals
        const totalTransactions = filteredTransactions.length;
        const totalSpent = filteredTransactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

        return res.status(200).json({
            success: true,
            message: 'Transactions retrieved successfully',
            data: {
                transactions: paginatedTransactions,
                pagination: {
                    total: totalTransactions,
                    limit: limitNum,
                    offset: offsetNum,
                    hasMore: offsetNum + limitNum < totalTransactions
                },
                summary: {
                    totalTransactions: totalTransactions,
                    totalSpent: totalSpent,
                    completedTransactions: filteredTransactions.filter(t => t.status === 'completed').length,
                    failedTransactions: filteredTransactions.filter(t => t.status === 'failed').length
                }
            }
        });

    } catch (error) {
        console.error('Transaction History API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve transactions',
            error: error.message
        });
    }
}

// Generate mock transaction data
function generateMockTransactions() {
    const networks = ['MTN', 'Airtel', 'Glo', '9mobile'];
    const types = ['airtime', 'data'];
    const statuses = ['completed', 'failed', 'pending'];
    const dataSizes = ['1GB', '2GB', '5GB', '10GB'];

    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const network = networks[Math.floor(Math.random() * networks.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Create date in the past (up to 30 days ago)
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);

        const transaction = {
            id: `TXN${Date.now() + i}`,
            reference: `PAY4ME${Date.now() + i}`,
            type: type,
            network: network,
            phoneNumber: generateRandomPhone(),
            amount: type === 'airtime' 
                ? [100, 200, 500, 1000, 2000][Math.floor(Math.random() * 5)]
                : [500, 1000, 2000, 5000][Math.floor(Math.random() * 4)],
            status: status,
            createdAt: date.toISOString(),
            completedAt: status === 'completed' ? date.toISOString() : null,
            confirmationCode: status === 'completed' ? generateConfirmationCode() : null,
            provider: ['HustleSIM', 'Paystack', 'Simulation'][Math.floor(Math.random() * 3)],
            ...(type === 'data' && { 
                dataSize: dataSizes[Math.floor(Math.random() * dataSizes.length)] 
            })
        };

        transactions.push(transaction);
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return transactions;
}

function generateRandomPhone() {
    const prefixes = ['0803', '0806', '0802', '0808', '0805', '0807'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(7, '0');
    return prefix + suffix;
}

function generateConfirmationCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}