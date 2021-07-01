# TODO

- clean input after send comment
- multiple event listen (x5~6)
- check deleted comment
- set price at zero after transfer /!\

## IPFS

Installer `axios`

```js
const axios = require("axios")

const data = {
  name: "Comment N°23",
  content: "Salut la france! on a perdu hier c'est nul",
  hashedComment:
    "0x64640d8667ed929facb85fd66ac32b1aa97bd31a77b8deb4a2dd8bd47dc40b75",
  tokenId: 23,
  txHash: "0x64640d8667ed929facb85fd66ac32b1aa97bd31a77b8deb4a2dd8bd47dc40b75",
}

const post = async () => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
  const response = await axios.post(url, data, {
    headers: {
      pinata_api_key: "API_KEY",
      pinata_secret_api_key: "API_SECRET",
    },
  })
  console.log(response)
}

const read = async () => {
  const url = `https://gateway.pinata.cloud/ipfs/${CID}`
  try {
    const response = await axios.get(url, {
      headers: {
        pinata_api_key: "bb99854d4dda5bdef9ea",
        pinata_secret_api_key:
          "ef822e085461f33ae95fbd337b45a2ae4440b3a8bd31b6c156917a06146fe3a3",
      },
    })
    console.log(response.data)
  } catch (e) {
    console.log(e)
  }
}

//read()
//post()
```
