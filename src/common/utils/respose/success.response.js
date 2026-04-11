export const successResponse = ({ res, status = 200, message = "done", data = undefined }) => {
  return res.status(status).json({ success: true, message, data });
};
