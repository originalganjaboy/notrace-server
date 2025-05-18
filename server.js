const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const SHEET_URL = "https://api.sheetbest.com/sheets/61536e0f-5456-440f-b198-49f1fd2e7a00";

app.post('/webhook', async (req, res) => {
  const data = req.body;

  if (data.type === "payment" && data.data && data.data.id) {
    const paymentId = data.data.id;

    try {
      const result = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer APP_USR-...` // token real
        }
      });

      const payment = result.data;

      if (payment.status === "approved" && payment.transaction_amount === 5.97) {
        const userEmail = payment.payer.email;
        const key = gerarKeyAleatoria(); // você pode associar por e-mail ou gerar randomicamente

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await axios.post(SHEET_URL, { key, expiresAt, ativo: "true" });

        console.log(`✅ Pagamento confirmado e key ${key} ativada para ${userEmail}`);
      }

    } catch (err) {
      console.error("Erro ao consultar pagamento:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});

function gerarKeyAleatoria() {
  return Math.random().toString(36).substring(2, 10);
}

app.listen(3000, () => console.log("🚀 Webhook rodando na porta 3000"));
