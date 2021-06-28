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
        author: "",
        txHash: action.tx.hash,
      }
      return {
        ...state,
        commentList: [...state.commentList, commentInfo],
      }
    case "COMMENT_LINK":
      for (let elem of state.commentList) {
        if (elem.hash === action.hashedComment) {
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
    default:
      throw new Error(
        `commentReducer: wrong input in the reducer ${action.type}`
      )
  }
}
