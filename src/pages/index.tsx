import db from "@/lib/db";
import { Btn } from "@/ui/Btn";
import Modal from "@/ui/Modal";
import TextField from "@/ui/TextField";
import { parse } from "cookie";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { Car } from "./api/car-list";

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
  const [showEditModal, setShowEditModal] = useState<null | {
    success?: boolean;
    id: string;
  }>(null);
  const [detailToEdit, setDetailToEdit] = useState<string>("");

  const handleApproval = async (id: string, approval: boolean) => {
    try {
      const response = await fetch("/api/approval", {
        method: "PATCH",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
        },
        body: JSON.stringify({ id, approval: approval ? 1 : 0 }),
      });

      console.log("response", response);
      window.location.reload();
    } catch (err) {
      console.log("err", err);
    }
  };

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
      console.log("prev", prev);
      if (next && prev === totalPages) return prev;
      if (!next && prev === 1) return prev;

      return next ? prev + 1 : prev - 1;
    });

    setLoadedCars(result.data);
  };

  const handleUpdateDetail = async (id: string, detailToEdit: string) => {
    try {
      const response = await fetch("/api/car-edit", {
        method: "PATCH",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
        },
        body: JSON.stringify({ id, details: detailToEdit }),
      });

      console.log("response", response);
    } catch (err) {
      console.log("err", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-[3.5rem]">
      <Modal
        success={showEditModal?.success}
        isOpen={showEditModal !== null}
        onClose={async () => {
          await handleUpdateDetail(showEditModal?.id as string, detailToEdit);

          setShowEditModal(null);
          window.location.reload();
        }}
        header="Please Update Detail"
      >
        <TextField
          value={detailToEdit || ""}
          onChange={(ev) => setDetailToEdit(ev.target.value)}
          label="Detail"
        />
      </Modal>

      <div className="container mx-auto px-4">
        <div className="rounded-xl overflow-hidden border border-black/30">
          <table className="w-full">
            <tbody>
              <tr className="">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">details</th>
                <th className="text-left p-2">Actions</th>
              </tr>
              {loadedCars.map((item) => {
                return (
                  <tr className="bg-white" key={item.id}>
                    <td className="p-2">
                      {item.id}.&nbsp;{item.name}
                    </td>
                    <td className="p-2">{item.details}</td>
                    <td className="p-2 flex gap-2">
                      <Btn
                        onPress={() => handleApproval(item.id, true)}
                        size="sm"
                        isDisabled={item.approval == 1}
                      >
                        Approve
                      </Btn>
                      <Btn
                        onPress={() => handleApproval(item.id, false)}
                        size="sm"
                        intent="danger"
                        isDisabled={item.approval == 0}
                      >
                        Reject
                      </Btn>
                      <Btn
                        size="sm"
                        intent="clear"
                        onPress={() => {
                          setShowEditModal({ success: true, id: item.id });
                          setDetailToEdit(
                            loadedCars.find((carItem) => item.id === carItem.id)
                              ?.details || ""
                          );
                        }}
                      >
                        Edit
                      </Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
