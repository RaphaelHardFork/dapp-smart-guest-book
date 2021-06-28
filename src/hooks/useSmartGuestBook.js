import { ethers } from "ethers"
import { useContext, useEffect, useReducer } from "react"
import { Web3Context } from "web3-hooks"
import { ContractsContext } from "../contexts/ContractsContext"
import { commentReducer } from "../reducers/commentReducer"

export const useSmartGuestBook = () => {
  const [web3State] = useContext(Web3Context)
  const [contract] = useContext(ContractsContext)

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
  const { commentsData, listOfComments, filter, deleted } = state

  useEffect(() => {
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
  }, [contract, web3State.account])

  useEffect(() => {
    if (contract) {
      const cb = (author, hashedComment, tokenId) => {
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
      }
      contract.on("CommentLeaved", cb)
      return () => {
        contract.off("CommentLeaved", cb)
      }
    }
  }, [contract, web3State.account, commentsData])

  useEffect(() => {
    if (contract) {
      const getHistory = async () => {
        try {
          let commentAdded = await contract.filters.CommentLeaved()
          let commentDeleted = await contract.filters.CommentDeleted()
          console.log("COMMENT HISTORY")
          commentAdded = await contract.queryFilter(commentAdded)
          commentDeleted = await contract.queryFilter(commentDeleted)
          console.log(commentAdded)
          console.log(commentDeleted)
          dispatch({ type: "COMMENT_HISTORY", commentAdded, commentDeleted })
        } catch (e) {
          console.log(e)
        }
      }
      getHistory()
    }
  }, [contract, web3State.account])

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
