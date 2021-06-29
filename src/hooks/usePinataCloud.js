const axios = require("axios")

export const usePinataCloud = () => {
  const pinJSON = async (data) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
    try {
      const response = await axios.post(url, data, {
        headers: {
          pinata_api_key: `${process.env.REACT_APP_API_KEY}`,
          pinata_secret_api_key: `${process.env.REACT_APP_API_SECRET}`,
        },
      })
      console.log("PINNED to IPFS")
      return response.data.IpfsHash
    } catch (e) {
      console.error(e)
    }
  }

  const readJSON = async (cid) => {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`
    try {
      const response = await axios.get(url, {
        headers: {
          pinata_api_key: `${process.env.REACT_APP_API_KEY}`,
          pinata_secret_api_key: `${process.env.REACT_APP_API_SECRET}`,
        },
      })
      return response.data
    } catch (e) {
      console.log(e)
    }
  }
  return [pinJSON, readJSON]
}