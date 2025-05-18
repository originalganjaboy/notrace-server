import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const SHEET_URL = "https://api.sheetbest.com/sheets/61536e0f-5456-440f-b198-49f1fd2e7a00";
const MERCADOPAGO_TOKEN = "APP_USR-7933764401128865-051709-71ab1fcf162a951d5c730548a63330f4-2442304465";

app.post("/webhook", async (req, res) => {
  const data = req.body;

  if (data.type === "payment" && data.data?.id) {
    const paymentId = data.data.id;

    try {
      const result = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_TOKEN}`
        }
      });

      const payment = result.data;

      if (payment.status === "approved") {
        const valor = payment.transaction_amount;
        const email = payment.payer.email;

        const key = gerarKeyAleatoria();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        await axios.post(SHEET_URL, {
          key,
          expiresAt,
          ativo: "true"
        });

        console.log(`✅ Pagamento de R$${valor.toFixed(2)} aprovado para ${email}. Key ativada: ${key}`);
      }
    } catch (err) {
      console.error("❌ Erro ao consultar pagamento:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});

function gerarKeyAleatoria() {
  return Math.random().toString(36).substring(2, 10);
}

app.listen(3000, () => console.log("🚀 Webhook ativo na porta 3000"));
