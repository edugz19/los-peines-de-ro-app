const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors")({ origin: true });
const stripe = require("stripe")(
  "sk_test_51KX10dDbG1rPW2s64WYaoaETzuXwF5OyhLroSenocfMxkXr3Xbv9dDodht1UQx1RidR4bHozBsTcJmqrF7RqUx1D00Z6XJwg2i"
);

const stripePay = express();
stripePay.use(cors);
admin.initializeApp(functions.config().firebase);

// const clientId = 'AUzgp-Oy3AhP715O5cskSHHbXMV1lBmUqyzwM5FMhYMguKU48BytgQdKfkVh9m2mgc3OUnzlfOkoHOD6';
// const secretKey = 'ECawuCbTfHwpZwayj1jfr8Bm3gqKZ09LYpW8UapAwdXVb2FInxdekUP-f2NAC_356UR953QFYobhc0jQ';
// const paypal = require('@paypal/checkout-server-sdk');
// const env = new paypal.core.SandboxEnvironment(clientId, secretKey);
// const client = new paypal.core.PayPalHttpClient(env);
// let request = new paypal.orders.OrdersCreateRequest();

exports.stripePay = functions.region('europe-west2').https.onRequest((req, res) => {
  return cors(req, res, () => {
    stripe.charges
      .create({
        amount: req.body.servicio.precio * 100,
        currency: "eur",
        description: req.body.servicio.nombre.toUpperCase(),
        source: req.body.token,
      })
      .then((charge) => {
        res.send(charge);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

// stripePay.post("/stripe_checkout", async (req, res) => {
//   return cors(req, res, async () => {
//     console.log(req.body);

//     const chargeObject = await stripe.charges.create({
//       amount: Math.round(req.body.servicio.precio * 100),
//       currency: "eur",
//       source: req.body.token,
//       description: req.body.servicio.descripcion.toUpperCase(),
//     });

//     try {
//       await stripe.charges.capture(chargeObject.id);
//       res.status(200).send(chargeObject);
//     } catch (error) {
//       await stripe.refunds.create({ charge: chargeObject });
//     }
//   });
// });

// exports.stripePay = functions.region("europe-west2").https.onRequest(stripePay);

// exports.paypalCreateOrder = functions.https.onCall(async (data, context) => {
//   request.requestBody({
//     "intent": "capture",
//     "purchase_units": [
//       {
//         "amount": {
//           "currency_code": "EUR",
//           "value": "100.00"
//         }
//       }
//     ]
//   });

//   const response = await client.execute(request);

//   return response.result;
// });

// exports.paypalHandleOrder = functions.https.onCall(async (data, context) => {
//   const orderId = data.orderId;
//   request = new paypal.orders.OrdersCaptureRequest(orderId);
//   request.requestBody({});
//   const response = await client.execute(request);

//   return response.result;
// });
