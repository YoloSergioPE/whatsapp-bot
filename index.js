import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// ---- VERIFICACIÓN WEBHOOK ----
app.get("/webhook", (req, res) => {
    const verify_token = process.env.VERIFY_TOKEN;

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === verify_token) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// ---- RECIBIR MENSAJES ----
app.post("/webhook", async (req, res) => {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message) {
        const from = message.from;
        const text = message.text?.body;

        console.log("Mensaje recibido:", text);

        // Respuesta simple
        await enviarMensaje(from, "¡Hola! Tu mensaje fue recibido correctamente.");
    }

    res.sendStatus(200);
});

// ---- ENVIAR MENSAJES ----
async function enviarMensaje(to, message) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.PHONE_ID;

    await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            text: { body: message }
        })
    });
}

app.listen(3000, () => console.log("Servidor en la nube funcionando"));
