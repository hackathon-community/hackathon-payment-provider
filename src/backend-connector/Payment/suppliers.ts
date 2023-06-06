import axios from "axios";
import { RecipientsBuilderPayload, Supplier } from "../typings";

export async function getOrderSuppliersInfo(
  payload: RecipientsBuilderPayload
): Promise<{ message: string; suppliers?: Supplier[] }> {
  return await axios
    .post(
      "https://app.io.vtex.com/vtex.recipients-builder/v1/vtexdayhackathon2/teste/minicart-suppliers/",
      payload,
      {
        headers: {
          vtexidclientautcookie:
            "eyJhbGciOiJFUzI1NiIsImtpZCI6IjBCNDYwNERGMTA4RjdENUZBNEI4NzZFMkZGREQzMjQ4MDIxMUJEQTYiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJ2aWN0b3IuZXZhbmdlbGlzdGEyMDEwQGdtYWlsLmNvbSIsImFjY291bnQiOiJ2dGV4ZGF5aGFja2F0aG9uMiIsImF1ZGllbmNlIjoiYWRtaW4iLCJzZXNzIjoiZGFjMzJkMTMtOTE0Zi00YTQ5LTkwYzUtMGU2ODI3ZWE5ZmZhIiwiZXhwIjoxNjg2MDU3OTIyLCJ1c2VySWQiOiI0YzllZGY0Ny01YjcyLTQ5MTAtYmYxZS00ZjIxNzJjMDYwMTEiLCJpYXQiOjE2ODU5NzE1MjIsImlzcyI6InRva2VuLWVtaXR0ZXIiLCJqdGkiOiIzMWE4ZDY2YS01NjhiLTQ5MjUtOThkZi1kZTBjZGI2Njk5MGYifQ.cfVLScfmmw8D8S8zUJ1IfkIk_PY-mH4rD92w_KcO_rib_Oe3kb0TS3-cth9Yzfr1dWTUg_bM_Uj18S76udSKXQ",
        },
      }
    )
    .then((r) => r.data)
    .catch((e) => console.log("🚀", e.response.data));
}
