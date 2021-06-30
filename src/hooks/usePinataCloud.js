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
      return response.data.IpfsHash
    } catch (e) {
      console.error(e)
    }
  }

  const deleteJSON = async (cid) => {
    const url = `https://api.pinata.cloud/pinning/unpin/${cid}`
    try {
      await axios.delete(url, {
        headers: {
          pinata_api_key: `${process.env.REACT_APP_API_KEY}`,
          pinata_secret_api_key: `${process.env.REACT_APP_API_SECRET}`,
        },
      })
    } catch (e) {
      console.error(e)
    }
  }
  return [pinJSON, deleteJSON]
}
