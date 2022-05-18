const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors")({ origin: true });
const stripe = require("stripe")(
  "sk_test_51KX10dDbG1rPW2s64WYaoaETzuXwF5OyhLroSenocfMxkXr3Xbv9dDodht1UQx1RidR4bHozBsTcJmqrF7RqUx1D00Z6XJwg2i"
);
const nodemailer = require("nodemailer");

const stripePay = express();
stripePay.use(cors);

const sendEmail = express();
sendEmail.use(cors);

admin.initializeApp(functions.config().firebase);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "edugarciazambrana19@gmail.com",
    pass: "xwjbgkftifkztyfz",
  },
});

exports.stripePay = functions
  .region("europe-west2")
  .https.onRequest((req, res) => {
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

exports.sendEmail = functions
  .region("europe-west2")
  .https.onRequest((req, res) => {
    return cors(req, res, () => {
      const mailOptions = {
        from: `Los Peines de Ro <edugarciazambrana19@gmail.com>`,
        to: req.body.usuario.email,
        subject: "Reserva en Peluquería Los Peines de Ro",
        html: `<div>
                <h2>Confirmación de reserva</h2>
                <h4>Hola ${req.body.usuario.displayName},</h4>
                <p>
                Se ha confirmado tu reserva para el día ${req.body.reserva.fecha} a las ${req.body.reserva.horaInicio} para un
                corte de pelo.
                </p>
                <p>
                La factura está adjuntada en este correo. Atentamente el equipo de Los
                Peines de Ro.
                </p><br/>
                <img
                  style="width: 80px; margin-top: 20px;"
                  src="https://firebasestorage.googleapis.com/v0/b/los-peines-de-ro.appspot.com/o/icon.png?alt=media&token=369dd884-3e61-4e3c-ae88-a3a0be54ac17"
                  alt="Logo"
                />
              </div>
              `,
        attachments: [
          {
            // encoded string as an attachment
            filename: req.body.reserva.id + ".pdf",
            content: req.body.data,
            encoding: "base64",
          },
        ],
      };

      return transporter.sendMail(mailOptions, (error, data) => {
        if (error) {
          console.log(error);
          return;
        }

        console.log("Mail enviado");
      });
    });
  });
