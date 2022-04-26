const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(
  "sk_test_51KX10dDbG1rPW2s64WYaoaETzuXwF5OyhLroSenocfMxkXr3Xbv9dDodht1UQx1RidR4bHozBsTcJmqrF7RqUx1D00Z6XJwg2i"
);
admin.initializeApp(functions.config().firebase);

const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors());

const clientId = 'AUzgp-Oy3AhP715O5cskSHHbXMV1lBmUqyzwM5FMhYMguKU48BytgQdKfkVh9m2mgc3OUnzlfOkoHOD6';
const secretKey = 'ECawuCbTfHwpZwayj1jfr8Bm3gqKZ09LYpW8UapAwdXVb2FInxdekUP-f2NAC_356UR953QFYobhc0jQ';
const paypal = require('@paypal/checkout-server-sdk');
const env = new paypal.core.SandboxEnvironment(clientId, secretKey);
const client = new paypal.core.PayPalHttpClient(env);
let request = new paypal.orders.OrdersCreateRequest();

exports.payWithStripe = functions.https.onRequest((req, res) => {
  stripe.charges
    .create({
      amount: req.body.servicio.descripcion * 100,
      currency: "eur",
      description: req.body.servicio.descripcion,
      source: req.body.token,
    })
    .then((charge) => {
      res.send(charge);
    })
    .catch((err) => {
      console.log(err);
    });
});

exports.paypalCreateOrder = functions.https.onCall(async (data, context) => {
  request.requestBody({
    "intent": "capture",
    "purchase_units": [
      {
        "amount": {
          "currency_code": "EUR",
          "value": "100.00"
        }
      }
    ]
  });

  const response = await client.execute(request);

  return response.result;
});

exports.paypalHandleOrder = functions.https.onCall(async (data, context) => {
  const orderId = data.orderId;
  request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const response = await client.execute(request);

  return response.result;
});
