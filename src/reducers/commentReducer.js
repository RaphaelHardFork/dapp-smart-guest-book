export const commentReducer = (state, action) => {
  switch (action.type) {
    case "TX_WAITING":
      return {
        ...state,
        txStatus: "Waiting for confirmation",
      }

    case "TX_PIN":
      return {
        ...state,
        txStatus: "Pinning to IPFS",
      }

    case "TX_PENDING":
      return {
        ...state,
        txStatus: "Pending",
      }

    case "TX_SUCCESS":
      return {
        ...state,
        txStatus: "Success",
      }

    case "TX_FAILURE":
      return {
        ...state,
        txStatus: `Failed with ${action.payload.message}`,
      }

    case "FILTER":
      return {
        ...state,
        filter: !state.filter,
      }

    case "DELETED":
      return {
        ...state,
        deleted: !state.deleted,
      }

    case "MODERATOR":
      return {
        ...state,
        moderator: action.payload,
      }

    case "TX_STATUS":
      const statusStyle = (CountStat) => {
        switch (CountStat) {
          case "":
            return "info"
          case "Waiting for confirmation":
            return "info"
          case "Pending":
            return "warning"
          case "Success":
            return "success"
          case "Failed":
            return "error"
          default:
            return "info"
        }
      }
      let style
      if (state.txStatus.startsWith("Failed")) {
        style = statusStyle("Failed")
      } else {
        style = statusStyle(state.txStatus)
      }
      return {
        ...state,
        statusStyle: style,
      }

    case "COMMENT_ADDED":
      let commentInfo = {
        content: action.comment,
        hash: action.hashedComment,
        author: action.author.toLowerCase(),
        txHash: action.tx.hash,
        tokenId: 0,
      }
      return {
        ...state,
        commentsData: [...state.commentsData, commentInfo],
      }

    case "COMMENT_LINK":
      let listOfHash = state.commentsData.map((elem) => {
        return elem.hash
      })
      let index = listOfHash.indexOf(action.hashedComment)
      let newCommentsData = state.commentsData
      if (index !== -1) {
        newCommentsData[index].tokenId = action.tokenId
      }
      return {
        ...state,
        commentsData: newCommentsData,
      }

    case "COMMENT_HISTORY":
      let commentsList = []
      let deletedId = action.commentDeleted.map((elem) => {
        return elem.args[2].toString()
      })
      for (let elem of action.commentAdded) {
        commentsList.push({
          author: elem.args[0].toLowerCase(),
          hashedComment: elem.args[1],
          tokenId: elem.args[2].toString(),
          txHash: elem.transactionHash,
          deleted: deletedId.includes(elem.args[2].toString()),
        })
      }
      return {
        ...state,
        listOfComments: commentsList,
      }

    case "DISPLAY_LIST":
      return {
        ...state,
        displayedList: [...action.payload],
      }

    default:
      throw new Error(
        `commentReducer: wrong input in the reducer ${action.type}`
      )
  }
}
