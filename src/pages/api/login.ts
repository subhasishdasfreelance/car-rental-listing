import db, { ResponseType } from "@/lib/db";
import { parse, serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

type User = { email: string; name: string, password: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  try {
    console.log("here");
    const cookies = parse(req.headers.cookie || "");
    if (cookies.token === process.env.TOKEN) {
      res
        .status(200)
        .json({
          success: false,
          msg: "you are already logged in, please logout first",
        });
      return;
    }

    console.log("req.body", req.body);
    const {email, password} = req.body

    console.log('email', email)

    const fetchedUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as User;

    console.log("fetchedUser", fetchedUser);
    if(!fetchedUser) {
      res.status(401).json({ success: false, msg: "User not found" });
      return
    }
    if(!fetchedUser || fetchedUser.password !== password) {
      res.status(403).json({ success: false, msg: "Password did not match" });
      return
    }

    res.setHeader(
      "Set-Cookie",
      serialize("token", process.env.TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // After 1 week it will go away
      })
    );

    res.status(200).json({ success: true, msg: "login is successful" });
  } catch (err) {
    console.log("err", err);
    res
      .status(500)
      .json({ success: false, msg: "some error occurred while logging in" });
  }
}
