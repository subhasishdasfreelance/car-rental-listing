import { parse } from "cookie";
import { GetServerSideProps } from "next";
import { Car } from "./api/car-list";
import db from "@/lib/db";
import { Btn } from "@/ui/Btn";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const cookies = parse(req.headers.cookie || "");
    if (cookies.token !== process.env.TOKEN) {
      // return {
      //   props: {
      //     cars: [],
      //   },
      // };
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const cars = db.prepare("SELECT * FROM cars LIMIT 10").all() as Car[];

    return {
      props: {
        cars: cars,
      },
    };
  } catch (err) {
    console.log("err", err);
    return {
      props: {
        cars: [],
      },
    };
  }
};

export default function Index({ cars }: { cars: Car[] }) {
  const [loadedCars, setLoadedCars] = useState(cars);
  const [offset, setOffset] = useState(10);
  const [reachedEnd, setReachedEnd] = useState(false);

  console.log("loadedCars", loadedCars);
  console.log("offset", offset);

  const handleLoadMore = async () => {
    const response = await fetch("/api/car-list", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: JSON.stringify({ offset }),
    });

    const result = await response.json();
    console.log("result", result);

    if (result.data.length < 10) {
      setReachedEnd(true);
    }

    setOffset((prev) => (prev += 10));
    setLoadedCars((prev) => {
      return [...prev, ...result.data];
    });
  };

  console.log("cars", cars);
  return (
    <div className="max-w-7xl mx-auto pt-[3.5rem]">
      <div className="container mx-auto px-4">
        <table className="w-full">
          <tbody>
            <tr className="">
              <th className="text-left px-2">Name</th>
              <th className="text-left px-2">details</th>
              <th className="text-left px-2">Actions</th>
            </tr>
            {loadedCars.map((item, index) => {
              return (
                <tr className="border rounded-xl bg-white" key={item.id}>
                  <td className="p-2">
                    {index + 1}.&nbsp;{item.name}
                  </td>
                  <td className="p-2">{item.details}</td>
                  <td className="p-2 flex gap-2">
                    <Btn size="sm">Approve</Btn>
                    <Btn size="sm" intent="danger">
                      Reject
                    </Btn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-4 flex justify-center pb-20">
          <Btn isDisabled={reachedEnd} onPress={handleLoadMore}>
            Load More
          </Btn>
        </div>
      </div>
    </div>
  );
}
