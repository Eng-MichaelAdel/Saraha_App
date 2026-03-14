export const errorResponse = ({ message = "fail", status = 400, extr = undefined }) => {
  throw new Error(message, { cause: { status } });
};
