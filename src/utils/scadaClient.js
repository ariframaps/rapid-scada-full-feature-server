const axios = require("axios");

const SCADA_BASE_URL = process.env.SCADA_BASE_URL;

class ScadaClient {
  constructor() {
    this.sessionCookie = null;
  }

  async login() {
    try {
      const res = await axios.post(
        `${SCADA_BASE_URL}/Api/Auth/Login`,
        {
          username: process.env.SCADA_USERNAME,
          password: process.env.SCADA_PASSWORD,
        },
        { withCredentials: true }
      );

      const setCookieHeader = res.headers["set-cookie"];
      if (setCookieHeader && setCookieHeader.length > 0) {
        this.sessionCookie = setCookieHeader[0].split(";")[0]; // ambil cookie paling depan
        return true;
      }
      return false;
    } catch (err) {
      console.error("SCADA login error:", err.message);
      return false;
    }
  }

  async getCurData(channelNums) {
    if (!this.sessionCookie) {
      const loginSuccess = await this.login();
      if (!loginSuccess) throw new Error("SCADA login failed");
    }

    const res = await axios.get(
      `${SCADA_BASE_URL}/Api/Main/GetCurData?cnlNums=${channelNums}`,
      { headers: { Cookie: this.sessionCookie } }
    );

    return res.data;
  }

  async sendCommand(channelNum, cmdVal) {
    if (!this.sessionCookie) {
      const loginSuccess = await this.login();
      if (!loginSuccess) throw new Error("SCADA login failed");
    }

    const res = await axios.post(
      `${SCADA_BASE_URL}/Api/Main/SendCommand`,
      { cnlNum: channelNum, cmdVal },
      { headers: { Cookie: this.sessionCookie } }
    );

    return res.data;
  }
}

module.exports = new ScadaClient();
