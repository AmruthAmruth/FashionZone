export const HttpStatusCode = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
});

export const CommonMessages = Object.freeze({
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  PRODUCT_NOT_FOUND: "Product not found",
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "User not logged in",
  BAD_REQUEST: "Bad Request",
  ORDER_NOT_FOUND: "Order not found",
  CART_NOT_FOUND: "Cart not found",
  SUCCESS: "Success"
});
