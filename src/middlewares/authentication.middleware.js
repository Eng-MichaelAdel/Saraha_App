import { decodeToken, UnauthorizedException } from "../common/utils/index.js";

export const authenticate = async (req, res, next) => {

  //  get access token from headers
  const { authorization } = req.headers;
  
  //  check if token is sent in headers
  if (!authorization) {
    throw new UnauthorizedException("Authorization token is required");
    ;
  }

  //  detect the type of authorization token
  const [prefix, token] = authorization.split(" ");
  if (prefix !== "Bearer") {
    throw new UnauthorizedException("invalid Authorization type , Expected Bearer token");
    ;
  }

  //  decode user data according to the authorization type
  const userData = await decodeTokenByAuthType(prefix, token);
  
  
  req.user = userData;
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
      throw new UnauthorizedException("invalid Authorization type , Expected Bearer token");
      break;
  }

  return userData;
};
