// Firebase Functions Implementation
// File: functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

// Airtime recharge function
exports.rechargeAirtime = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const { phone, amount, network, userId } = req.body;

            // Call VTPass API for airtime recharge
            const vtpassResponse = await fetch('https://vtpass.com/api/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: functions.config().vtpass.username,
                    password: functions.config().vtpass.password,
                    service_id: `${network}-airtime`,
                    amount: amount,
                    phone: phone,
                    request_id: `req_${Date.now()}`
                })
            });

            const result = await vtpassResponse.json();

            if (result.code === '000') {
                // Save transaction to Firestore
                await admin.firestore().collection('transactions').add({
                    userId: userId,
                    type: 'airtime',
                    network: network,
                    phone: phone,
                    amount: amount,
                    status: 'success',
                    reference: result.requestId,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                res.status(200).json({
                    success: true,
                    transaction_id: result.requestId,
                    message: 'Airtime recharge successful'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.response_description || 'Recharge failed'
                });
            }

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    });
});

// Data purchase function
exports.purchaseData = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const { phone, planId, network, userId } = req.body;

            // Data plan mapping
            const dataPlans = {
                'mtn_1gb': { service_id: 'mtn-data', variation_code: '1' },
                'mtn_2gb': { service_id: 'mtn-data', variation_code: '2' },
                'airtel_1gb': { service_id: 'airtel-data', variation_code: '1' },
                'glo_1gb': { service_id: 'glo-data', variation_code: '1' }
            };

            const plan = dataPlans[planId];
            if (!plan) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid data plan'
                });
            }

            // Call VTPass API for data purchase
            const vtpassResponse = await fetch('https://vtpass.com/api/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: functions.config().vtpass.username,
                    password: functions.config().vtpass.password,
                    service_id: plan.service_id,
                    billersCode: phone,
                    variation_code: plan.variation_code,
                    request_id: `data_${Date.now()}`
                })
            });

            const result = await vtpassResponse.json();

            if (result.code === '000') {
                // Save transaction to Firestore
                await admin.firestore().collection('transactions').add({
                    userId: userId,
                    type: 'data',
                    network: network,
                    phone: phone,
                    planId: planId,
                    status: 'success',
                    reference: result.requestId,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                res.status(200).json({
                    success: true,
                    transaction_id: result.requestId,
                    message: 'Data purchase successful'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.response_description || 'Data purchase failed'
                });
            }

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    });
});

// User authentication
exports.createUser = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const { email, password, phone, name } = req.body;

            // Create user with Firebase Auth
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: name,
                phoneNumber: phone
            });

            // Save user profile to Firestore
            await admin.firestore().collection('users').doc(userRecord.uid).set({
                email: email,
                name: name,
                phone: phone,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                balance: 0
            });

            res.status(200).json({
                success: true,
                user: {
                    uid: userRecord.uid,
                    email: email,
                    name: name,
                    phone: phone
                }
            });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    });
});