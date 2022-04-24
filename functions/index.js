const stripe = require('stripe')('sk_test_51KX10dDbG1rPW2s64WYaoaETzuXwF5OyhLroSenocfMxkXr3Xbv9dDodht1UQx1RidR4bHozBsTcJmqrF7RqUx1D00Z6XJwg2i');
const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.stripeCheckoutWithoutQueries = functions.https.onCall(async (data, context) => {
    let titulo = data['titulo'];
    let precio = data['precio'];

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            name: capitalizar(titulo),
            amount: Math.round(precio * 100),
            currency: 'eur',
            quantity: 1
        }],
        mode: 'payment',
        success_url: 'https://lospeinesdero.netlify.app/#/success',
        cancel_url: 'https://lospeinesdero.netlify.app/#/cancel'
    });

    return session.id;
})

function capitalizar(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}


