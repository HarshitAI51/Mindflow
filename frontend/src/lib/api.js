import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/api",
});

export async function verifyAnswer(answer) {
  const { data } = await api.post("/verify", { answer });
  return data;
}
