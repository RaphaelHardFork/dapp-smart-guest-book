import { ethers } from "ethers"
import { useContext, useEffect, useReducer } from "react"
import { Web3Context } from "web3-hooks"
import { ContractsContext } from "../contexts/ContractsContext"
import { commentReducer } from "../reducers/commentReducer"
import { useToast, Link } from "@chakra-ui/react"
const axios = require("axios")

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

  // Comment Leaved
  useEffect(() => {
    if (contract) {
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
      }
      contract.on("CommentLeaved", cb)
      return () => {
        contract.off("CommentLeaved", cb)
      }
    }
  }, [contract, toast])

  // load comments history
  useEffect(() => {
    if (contract) {
      dispatch({ type: "UPDATE" })
      const readJSON = async (cid) => {
        const url = `https://gateway.ipfs.io/ipfs/${cid}#x-ipfs-companion-no-redirect`
        try {
          const response = await axios.get(url, {
            timeout: 5000,
            transitional: { clarifyTimeoutError: true },
          })
          return response.data.comment
        } catch (e) {
          console.error(e)
          return `Content not well pinned yet...`
        }
      }

      const getHistory = async () => {
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
          const createList = async () => {
            for (let event of commentAdded) {
              let eventContent = await readJSON(event.args["cid"])

              let index = deletedId.indexOf(event.args["tokenId"].toString())
              commentsList.push({
                author: event.args["author"].toLowerCase(),
                tokenId: event.args["tokenId"].toString(),
                hashedComment: event.args["hashedComment"],
                cid: event.args["cid"],
                content: eventContent,
                deleted: index !== -1 ? true : false,
                txHash:
                  index !== -1
                    ? [event.transactionHash, deletedTx[index]]
                    : [event.transactionHash],
              })
            }
          }
          createList()
          dispatch({ type: "COMMENT_HISTORY", commentsList })
        } catch (e) {
          console.error(e)
        }
      }
      getHistory()
    }
  }, [contract])

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
