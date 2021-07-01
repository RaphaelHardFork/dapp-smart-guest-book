import { ethers } from "ethers"
import { useContext, useEffect, useReducer } from "react"
import { Web3Context } from "web3-hooks"
import { ContractsContext } from "../contexts/ContractsContext"
import { commentReducer } from "../reducers/commentReducer"
import { useToast, Link } from "@chakra-ui/react"
const axios = require("axios")

// read CID (only parameters and axios) => can be put outside of the hook
const readJSON = async (cid) => {
  const url = `https://gateway.ipfs.io/ipfs/${cid}#x-ipfs-companion-no-redirect`
  try {
    const response = await axios.get(url, {
      timeout: 5000,
    })
    return response.data.comment
  } catch (e) {
    console.error(e)
    return `Content not well pinned yet...`
  }
}

export const useSmartGuestBook = () => {
  const [web3State] = useContext(Web3Context)
  const [contract] = useContext(ContractsContext)
  const toast = useToast()

  const [state, dispatch] = useReducer(commentReducer, {
    listOfComments: [],
    displayedList: [],
    moderator: false,
    filter: false,
    txStatus: "",
    statusStyle: "info",
    deleted: false,
    loading: true,
    success: false,
    priceMap: [],
    ownerMap: [],
  })

  // account is Moderator?
  useEffect(() => {
    if (contract) {
      const checkRole = async () => {
        try {
          let isModerator = await contract.hasRole(
            ethers.utils.id("MODERATOR_ROLE"),
            web3State.account
          )
          dispatch({ type: "MODERATOR", payload: isModerator })
        } catch (e) {
          console.log(e)
        }
      }
      checkRole()
    }
  }, [contract, web3State.account])

  useEffect(() => {
    // Comment Leaved
    const cb = async (author, hashedComment, cid, tokenId, event) => {
      toast({
        title: `Comment Leaved (n°${tokenId})`,
        description: (
          <Link
            isExternal
            href={`https://rinkeby.etherscan.io/tx/${event.transactionHash}`}
          >
            See on Etherscan
          </Link>
        ),
        status: "success",
        duration: 7000,
        isClosable: true,
      })
      if (author.toLowerCase() === web3State.account) {
        dispatch({ type: "EVENT_LISTENED" })
      }
    }
    // Comment put in sale
    const cb1 = async (seller, tokenId, price, event) => {
      toast({
        title: `Comment n°${tokenId} put in sale for ${ethers.utils.formatEther(
          price.toString()
        )} ETH`,
        description: (
          <Link
            isExternal
            href={`https://rinkeby.etherscan.io/tx/${event.transactionHash}`}
          >
            See on Etherscan
          </Link>
        ),
        status: "success",
        duration: 7000,
        isClosable: true,
      })
      if (seller.toLowerCase() === web3State.account) {
        let price = await contract.inSale(tokenId)
        price = ethers.utils.formatEther(price.toString())
        dispatch({ type: "EVENT_PRICE", price, tokenId })
        dispatch({ type: "TX_SUCCESS" })
      }
    }

    // Comment removed from sale
    const cb2 = async (seller, tokenId, event) => {
      toast({
        title: `Comment n°${tokenId} removed from sale`,
        description: (
          <Link
            isExternal
            href={`https://rinkeby.etherscan.io/tx/${event.transactionHash}`}
          >
            See on Etherscan
          </Link>
        ),
        status: "info",
        duration: 7000,
        isClosable: true,
      })
      if (seller.toLowerCase() === web3State.account) {
        let price = await contract.inSale(tokenId)
        price = ethers.utils.formatEther(price.toString())
        dispatch({ type: "EVENT_PRICE", price, tokenId })
        dispatch({ type: "TX_SUCCESS" })
      }
    }

    // Comment bought
    const cb3 = async (seller, buyer, tokenId, price, event) => {
      toast({
        title: `Comment n°${tokenId} bought by ${buyer}`,
        description: (
          <Link
            isExternal
            href={`https://rinkeby.etherscan.io/tx/${event.transactionHash}`}
          >
            See on Etherscan
          </Link>
        ),
        status: "info",
        duration: 7000,
        isClosable: true,
      })
      if (buyer.toLowerCase() === web3State.account) {
        let owner = await contract.ownerOf(tokenId)
        owner = owner.toLowerCase()
        dispatch({ type: "EVENT_OWNER", owner, tokenId })
        dispatch({ type: "TX_SUCCESS" })
      }
    }
    if (contract) {
      contract.on("CommentLeaved", cb)
      contract.on("CommentInSale", cb1)
      contract.on("CommentRemovedFromSale", cb2)
      contract.on("CommentBought", cb3)
    }
    return () => {
      if (contract) {
        contract.off("CommentLeaved", cb)
        contract.off("CommentInSale", cb1)
        contract.off("CommentRemovedFromSale", cb2)
        contract.off("CommentBought", cb3)
      }
    }
  }, [contract, toast, web3State.account])

  // load comments
  useEffect(() => {
    let isMounted = true
    // get history and display
    const getHistory = async () => {
      if (contract && isMounted) {
        try {
          let commentAdded = await contract.filters.CommentLeaved()
          let commentDeleted = await contract.filters.CommentDeleted()
          commentAdded = await contract.queryFilter(commentAdded)
          commentDeleted = await contract.queryFilter(commentDeleted)
          const deletedId = commentDeleted.map((elem) => {
            return elem.args["tokenId"].toString()
          })
          const deletedTx = commentDeleted.map((elem) => {
            return elem.transactionHash
          })
          let commentsList = []
          let mapOfPrice = []
          let mapOfOwner = []
          const createList = async () => {
            for (let event of commentAdded) {
              let eventContent = await readJSON(event.args["cid"])
              let price = await contract.inSale(
                event.args["tokenId"].toString()
              )
              let owner = await contract.ownerOf(
                event.args["tokenId"].toString()
              )

              let index = deletedId.indexOf(event.args["tokenId"].toString())
              commentsList.push({
                author: event.args["author"].toLowerCase(),
                owner: owner.toLowerCase(),
                tokenId: event.args["tokenId"].toString(),
                hashedComment: event.args["hashedComment"],
                cid: event.args["cid"],
                content: eventContent,
                deleted: index !== -1 ? true : false,
                price: ethers.utils.formatEther(price.toString()),
                txHash:
                  index !== -1
                    ? [event.transactionHash, deletedTx[index]]
                    : [event.transactionHash],
              })
              mapOfPrice.push([
                event.args["tokenId"].toString(),
                ethers.utils.formatEther(price.toString()),
              ])
              mapOfOwner.push([event.args["tokenId"].toString(), owner])
            }
          }
          createList()
          dispatch({
            type: "COMMENT_HISTORY",
            commentsList,
            mapOfPrice,
            mapOfOwner,
          })
        } catch (e) {
          console.error(e)
        }
      }
    }
    dispatch({ type: "UPDATE" })
    getHistory()

    return () => (isMounted = false)
  }, [contract, state.success])

  useEffect(() => {
    dispatch({ type: "TX_STATUS" })
  }, [state.txStatus])

  if (contract === undefined) {
    throw new Error(
      `It seems that you are trying to use ContractContext outside of its provider`
    )
  }

  return [contract, state, dispatch]
}
