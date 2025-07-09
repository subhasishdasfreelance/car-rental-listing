import db, { ResponseType } from "@/lib/db";
import { parse } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method !== "PATCH") {
    res.status(405).json({ success: false, msg: "Method Not Allowed" });
    return;
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.token;

    if (token !== process.env.TOKEN) {
      res
        .status(401)
        .json({ success: false, msg: "Need to login first please" });
      return;
    }

    const { id, details } = req.body;

    if (!id || typeof details !== "string") {
      res.status(400).json({ success: false, msg: "Payload isn't valid" });
      return;
    }

    const result = db
      .prepare("UPDATE cars SET details = ? WHERE id = ?")
      .run(details, id);

    if (result.changes === 0) {
      res.status(404).json({ success: false, msg: "Car isn't found" });
    } else {
      db.prepare(
        "INSERT INTO audit_trail (email, action, timestamp) VALUES (?, ?, ?)"
      ).run("subhasishdasfreelance@gmail.com", "details updated", Date.now());

      res.status(200).json({ success: true, msg: "Car updated successfully" });
    }
  } catch (err) {
    console.error("err", err);
    res.status(500).json({
      success: false,
      msg: "Due to some errors, cars could not be updated",
    });
  }
}
