import db, { ResponseType } from "@/lib/db";
import { parse } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

export type Car = {
  id: string;
  name: string;
  details: string;
  approval: 0 | 1;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType<Car[]>>
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, msg: "Method Not Allowed" });
    return;
  }

  try {
    const { page } = req.body;
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;
    if (token !== process.env.TOKEN) {
      res
        .status(401)
        .json({ success: false, msg: "Need to login first please" });
      return;
    }

    const cars = db
      .prepare("SELECT * FROM cars LIMIT 10 OFFSET ?")
      .all((page - 1) * 10) as Car[];
    res.status(200).json({ success: true, data: cars });
  } catch (err) {
    console.log("err", err);
    res.status(500).json({
      success: false,
      msg: "Due to some errors, cars could not be fetched",
    });
  }
}
