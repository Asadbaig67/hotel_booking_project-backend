import jwt from "jsonwebtoken";

export const authorization = (req, res, next) => {
  const token = req.cookies.jwt_token;
  if (!token) {
    res.status(403).json("Tokken Ni Milla");
  }
  try {
    const data = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = data._id;
    next();
  } catch {
    res.status(403).json("Token Milla but");
  }
};
