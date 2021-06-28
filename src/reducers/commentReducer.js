export const commentReducer = (state, action) => {
  switch (action.type) {
    case "TX_WAITING":
      return {
        ...state,
        txStatus: "Waiting for confirmation",
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
    case "COMMENT_ADDED":
      let commentInfo = {
        content: action.comment,
        hash: action.hashedComment,
        author: action.author.toLowerCase(),
        txHash: action.tx.hash,
      }
      return {
        ...state,
        commentList: [...state.commentList, commentInfo],
      }
    case "COMMENT_LINK":
      for (let elem of state.commentList) {
        if (elem.hash === action.hashedComment) {
          console.log("AUTHOR_FINDED")
          elem.author = action.author
        }
      }
      return {
        ...state,
        commentList: state.commentList,
      }
    case "COMMENT_HISTORY":
      let argsList = []
      for (let elem of action.payload) {
        argsList.push(elem.args)
      }

      return {
        ...state,
        listOfArgs: argsList,
      }
    case "DISPLAY_LIST":
      return {
        ...state,
        displayedList: [...action.payload],
      }
    case "FILTER":
      return {
        ...state,
        filter: !state.filter,
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
    default:
      throw new Error(
        `commentReducer: wrong input in the reducer ${action.type}`
      )
  }
}
