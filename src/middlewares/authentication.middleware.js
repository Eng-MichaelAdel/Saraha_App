import { decodeToken, errorResponse } from "../common/utils/index.js";

export const authenticate = async (req, res, next) => {
  //  get access token from headers
  const { authorization } = req.headers;

  //  check if token is sent in headers
  if (!authorization) {
    errorResponse({ message: "Authorization token is required" });
  }

  //  detect the type of authorization token
  const [prefix, token] = authorization.split(" ");
  if (prefix !== "Bearer") {
    errorResponse({ message: "invalid Authorization type , Expected Bearer token", status: 401 });
  }

  //  decode user data according to the authorization type
  const user = await decodeTokenByAuthType(prefix, token);

  //  check if user account is available
  if (!user) {
    errorResponse({ message: "invalid user credentials ,please register", status: 404 });
  }

  req.user = user;
  next();
};

export const decodeTokenByAuthType = async (prefix, token) => {
  let userData;

  switch (prefix) {
    case "Basic":
      const [userName, Password] = Buffer.from(token, "base64").toString().split(":");
      userData = { userName, Password };
      break;
    case "Bearer":
      //  decode , verify and return user account
      userData = await decodeToken({ token });
      break;

    default:
      break;
  }

  return userData;
};
