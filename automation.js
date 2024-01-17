const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const apiKey = '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'; // Replace with your actual OpenAI API key
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: apiKey });

const app = express();
const PORT = 3000;

let webhookClient;

const CLIENT_ID = '1197016112387325952';
const CLIENT_SECRET = '-IfZbo2gwJe778CnZF65-am1F5bzttwo';
const REDIRECT_URI = 'http://localhost:3000/callback';

app.get('/', (req, res) => {
  res.send('<a href="/login">Login with Discord</a>');
});

app.get('/login', (req, res) => {
  res.redirect(
    `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=identify`
  );
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      querystring.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        scope: 'identify',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Poll every 5 seconds (adjust as needed)

    // Use the access token to make requests to the Discord API (e.g., /users/@me)
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = userResponse.data;

    // Handle the user data as needed
    console.log('User:', user);

    res.send(`Hello, ${user.username}#${user.discriminator}!`);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/webhook', (req, res) => {
  const data = req.body;

  if (webhookClient) {
    webhookClient.send(data.content);
  }

  res.status(200).send('Message received.');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function pollForMessages() {
  try {
    const response = await axios.get(`https://discord.com/api/v9/channels/1196305312148361369/messages?limit=20`, {
      headers: {
        Authorization: `NDM2NTAxNjY0NTgxNjgxMTYy.GZHTwu.jktMBc6_QWVeyoSliscpMc0ze4UOraVELTzLyk`,
        cookie:
          '__dcfduid=46a0f79063ec11ee887857e156e55573; __sdcfduid=46a0f79163ec11ee887857e156e55573e41885ee70c4c3d8b2ee1d73be54377c4a225d5cba95b08a6e1b55e958fb8b6e; __stripe_mid=b53c0614-0752-44fb-8d7a-589ff63d1655d55b84; _gcl_au=1.1.908269228.1702269192; _ga_Q149DFWHT7=GS1.1.1702269192.1.0.1702269197.0.0.0; cf_clearance=1ZyiSTQ6mPqxmbRR4QuW.az5DDmgOl67yUZE2tgmpsg-1705286592-0-2-92f65bb6.399e2fe9.58e97ec3-0.2.1705286592; __cfruid=a28ab1f00f78466deb060fa03bca0cc05ad57a47-1705457199; _cfuvid=aOtKpwtfi6AX35GdlEg56H73FdoGUBYHww3zMrX4FBQ-1705457199422-0-604800000; locale=vi; _gid=GA1.2.1093931642.1705461966; _ga=GA1.1.687414989.1702269192; OptanonConsent=isIABGlobal=false&datestamp=Wed+Jan+17+2024+10%3A37%3A40+GMT%2B0700+(Indochina+Time)&version=6.33.0&hosts=&landingPath=https%3A%2F%2Fdiscord.com%2F0n1-force&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1; _ga_YL03HBJY7E=GS1.1.1705461965.1.1.1705463411.0.0.0',
        'X-Super-Properties':
          'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6InZpLVZOIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyMC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTIwLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjI1OTA0OCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
      },
    });

    const messages = response.data[9];

    const randomNumber = Math.floor(Math.random() * 20) + 1;

    let reply = response.data[randomNumber].content;

    let result = await axios.post(
      'https://discord.com/api/v9/channels/1196305312148361369/messages',
      {
        content: reply,
        flags: 0,
        message_reference: {
          channel_id: '1196305312148361369',
          guild_id: '1060190166880370729',
          message_id: messages.id,
          mobile_network_type: 'unknown',
          nonce: '1197027244757745664',
          tts: false,
        },
      },
      {
        headers: {
          Authorization: `NDM2NTAxNjY0NTgxNjgxMTYy.GZHTwu.jktMBc6_QWVeyoSliscpMc0ze4UOraVELTzLyk`,
          cookie:
            '__dcfduid=46a0f79063ec11ee887857e156e55573; __sdcfduid=46a0f79163ec11ee887857e156e55573e41885ee70c4c3d8b2ee1d73be54377c4a225d5cba95b08a6e1b55e958fb8b6e; __stripe_mid=b53c0614-0752-44fb-8d7a-589ff63d1655d55b84; _gcl_au=1.1.908269228.1702269192; _ga_Q149DFWHT7=GS1.1.1702269192.1.0.1702269197.0.0.0; cf_clearance=1ZyiSTQ6mPqxmbRR4QuW.az5DDmgOl67yUZE2tgmpsg-1705286592-0-2-92f65bb6.399e2fe9.58e97ec3-0.2.1705286592; __cfruid=a28ab1f00f78466deb060fa03bca0cc05ad57a47-1705457199; _cfuvid=aOtKpwtfi6AX35GdlEg56H73FdoGUBYHww3zMrX4FBQ-1705457199422-0-604800000; locale=vi; _gid=GA1.2.1093931642.1705461966; _ga=GA1.1.687414989.1702269192; OptanonConsent=isIABGlobal=false&datestamp=Wed+Jan+17+2024+10%3A37%3A40+GMT%2B0700+(Indochina+Time)&version=6.33.0&hosts=&landingPath=https%3A%2F%2Fdiscord.com%2F0n1-force&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1; _ga_YL03HBJY7E=GS1.1.1705461965.1.1.1705463411.0.0.0',
          'X-Super-Properties':
            'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6InZpLVZOIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyMC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTIwLjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjI1OTA0OCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
        },
      }
    );
  } catch (error) {
    console.error('Error retrieving messages:', error.message);
  }
}

setInterval(pollForMessages, 5000);
