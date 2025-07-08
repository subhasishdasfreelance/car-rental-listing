import { ResponseType } from "@/lib/db";
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  try {
    res.setHeader(
      "Set-Cookie",
      serialize("token", process.env.TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      })
    );

    res.status(200).json({ success: true, msg: "Did logout" });
  } catch (err) {
    console.log("err", err);
    res
      .status(500)
      .json({ success: false, msg: "some error occurred while logging out" });
  }
}
