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
    const totalCars = db
      .prepare("SELECT COUNT(*) as count FROM cars")
      .get() as { count: number };

    return {
      props: {
        cars: cars,
        totalPages: Math.ceil(totalCars.count / 10),
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

export default function Index({
  cars,
  totalPages,
}: {
  cars: Car[];
  totalPages: number;
}) {
  const [loadedCars, setLoadedCars] = useState(cars);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePagination = async (next: boolean) => {
    const response = await fetch("/api/car-list", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: JSON.stringify({ page: next ? currentPage + 1 : currentPage - 1 }),
    });

    const result = await response.json();
    console.log("result", result);

    setCurrentPage((prev) => {
      console.log('prev', prev)
      if (next && prev === totalPages) return prev;
      if (!next && prev === 1) return prev;

      return next ? prev + 1 : prev - 1;
    });

    setLoadedCars(result.data);
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
            {loadedCars.map((item) => {
              return (
                <tr className="border rounded-xl bg-white" key={item.id}>
                  <td className="p-2">
                    {item.id}.&nbsp;{item.name}
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

        <div className="mt-4 flex justify-center pb-20 items-center gap-4">
          <Btn
            isDisabled={currentPage === 1}
            onPress={() => handlePagination(false)}
          >
            Prev
          </Btn>
          <p>Current Page: {currentPage}</p>
          <Btn
            isDisabled={totalPages === currentPage}
            onPress={() => handlePagination(true)}
          >
            Next
          </Btn>
        </div>
      </div>
    </div>
  );
}
