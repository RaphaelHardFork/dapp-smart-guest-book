import { ethers } from "ethers"
import { useCallback, useContext, useEffect, useReducer, useState } from "react"
import { Web3Context } from "web3-hooks"
import { ContractsContext } from "../contexts/ContractsContext"
import { commentReducer } from "../reducers/commentReducer"
import { usePinataCloud } from "./usePinataCloud"
const axios = require("axios")

export const useSmartGuestBook = () => {
  const [web3State] = useContext(Web3Context)
  const [contract] = useContext(ContractsContext)
  const [pinJSON, readJSON] = usePinataCloud()
  const [cid, setCID] = useState("")

  /*
  const initialState = {
    commentsData: [],
    listOfComments: [],
    displayedList: [],
    moderator: false,
    filter: false,
    txStatus: "",
    statusStyle: "info",
    deleted: false,
  }
  const [state, dispatch] = useReducer(
    commentReducer,
    initialState,
    (initialState) => {
      let data = JSON.parse(localStorage.getItem("comment-list"))
      if (data === null || data === undefined) {
        data = []
      }
      return {
        ...initialState,
        commentsData: data,
      }
    }
  )
  */
  const [state, dispatch] = useReducer(commentReducer, {
    listOfComments: [],
    displayedList: [],
    moderator: false,
    filter: false,
    txStatus: "",
    statusStyle: "info",
    deleted: false,
  })
  const { listOfComments, filter, deleted } = state

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
    if (contract) {
      const cb = async (author, hashedComment, cid, tokenId, event) => {
        const content = await readJSON(cid)
        const metadata = {
          tokenId: tokenId.toString(),
          author,
          hashedComment,
          content: content.comment, // need modification
          deleted: false,
          txHash: event.transactionHash,
        }
        const pin = async () => {
          pinJSON(metadata)
        }
        // CHANGE TOKEN URI NOW?
        //pin()
        /*
        if (author.toLowerCase() === web3State.account) {
          dispatch({
            type: "COMMENT_LINK",
            author,
            hashedComment,
            tokenId: tokenId.toString(),
          })
          console.log("linkage")
          localStorage.setItem("comment-list", JSON.stringify(commentsData))
        }
        */
      }
      contract.on("CommentLeaved", cb)
      return () => {
        contract.off("CommentLeaved", cb)
      }
    }
  }, [contract, web3State.account, pinJSON, readJSON])

  useEffect(() => {
    if (contract) {
      const readJSON = async (cid) => {
        const url = `https://gateway.ipfs.io/ipfs/${cid}#x-ipfs-companion-no-redirect`
        try {
          const response = await axios.get(url)
          return response.data.comment
        } catch (e) {
          console.log(e)
        }
      }
      const getHistory = async () => {
        try {
          let commentAdded = await contract.filters.CommentLeaved()
          let commentDeleted = await contract.filters.CommentDeleted()
          commentAdded = await contract.queryFilter(commentAdded)
          commentDeleted = await contract.queryFilter(commentDeleted)
          const deletedId = commentDeleted.map((elem) => {
            return elem.args[3].toString()
          })
          const deletedTx = commentDeleted.map((elem) => {
            return elem.transactionHash
          })
          let commentsList = []
          const createList = async () => {
            for (let event of commentAdded) {
              console.log(event.args["cid"])
              //console.log(await readJSON(event.args["cid"]))
              let index = deletedId.indexOf(event.args["tokenId"].toString())
              commentsList.push({
                author: event.args["author"].toLowerCase(),
                tokenId: event.args["tokenId"].toString(),
                hashedComment: event.args["hashedComment"],
                cid: event.args["cid"],
                content: await readJSON(event.args["cid"]),
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
          console.log(e)
        }
      }
      getHistory()
    }
  }, [contract, web3State.account])

  /*
  useEffect(() => {
    let linkedHash = commentsData.map((elem) => {
      return elem.hash
    })
    let list = []

    for (let comment of listOfComments) {
      if (filter) {
        if (comment.author !== web3State.account.toLowerCase()) {
          continue
        }
      }
      if (!deleted) {
        if (comment.deleted) {
          continue
        }
      }
      let index = linkedHash.indexOf(comment.hashedComment)
      if (index !== -1) {
        list.push({
          author: comment.author,
          hashedComment: comment.hashedComment,
          content: commentsData[index].content,
          txHash: comment.txHash,
          tokenId: comment.tokenId,
          deleted: comment.deleted,
        })
      } else {
        list.push({
          author: comment.author,
          hashedComment: comment.hashedComment,
          content: "Content not linked",
          txHash: comment.txHash,
          tokenId: comment.tokenId,
          deleted: comment.deleted,
        })
      }
    }
    dispatch({ type: "DISPLAY_LIST", payload: list })
  }, [
    filter,
    listOfComments,
    commentsData,
    dispatch,
    web3State.account,
    deleted,
  ])
  */

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
