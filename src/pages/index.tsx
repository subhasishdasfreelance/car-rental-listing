import db from "@/lib/db";
import { Btn } from "@/ui/Btn";
import Modal from "@/ui/Modal";
import TextField from "@/ui/TextField";
import { parse } from "cookie";
import { GetServerSideProps } from "next";
import { Dispatch, SetStateAction, useState } from "react";
import { Car } from "./api/car-list";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  try {
    const cookies = parse(req.headers.cookie || "");
    if (cookies.token !== process.env.TOKEN) {
      return {
        redirect: {
          destination: "/auth",
          permanent: false,
        },
      };
    }

    console.log("here");

    const carsStmt = db.prepare(
      `SELECT * FROM cars ${query.filter ? "WHERE approval = ?" : ""} LIMIT 10`
    );

    const cars = query.filter
      ? (carsStmt.all(query.filter) as Car[])
      : (carsStmt.all() as Car[]);

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count
    FROM cars
    ${query.filter ? "WHERE approval = ?" : ""}`
    );

    const totalCars = query.filter
      ? (countStmt.get(query.filter) as { count: number })
      : (countStmt.get() as { count: number });

    return {
      props: {
        cars: cars,
        totalPages: Math.ceil(totalCars.count / 10),
      },
    };
  } catch (err) {
    console.log("err", err);
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
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
  const router = useRouter();

  const handleApproval = async (
    id: string,
    approval: "approved" | "rejected"
  ) => {
    try {
      const response = await fetch("/api/approval", {
        method: "PATCH",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
        },
        body: JSON.stringify({ id, approval }),
      });

      console.log("response", response);
      // window.location.reload();
      handlePagination({ next: null });
    } catch (err) {
      console.log("err", err);
    }
  };

  type HandlePaginationPrams = {
    next?: boolean | null;
    filter?: "approved" | "rejected";
    page?: number;
  };
  const handlePagination = async ({
    next,
    filter,
    page,
  }: HandlePaginationPrams) => {
    const response = await fetch("/api/car-list", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: JSON.stringify({
        page: page
          ? page
          : next
          ? currentPage + 1
          : next === null
          ? currentPage
          : currentPage - 1,
        filter: filter || router.query.filter,
      }),
    });

    const result = await response.json();
    console.log("result", result);

    if (page) {
      setCurrentPage(page);
    } else if (next !== null) {
      setCurrentPage((prev) => {
        console.log("prev", prev);
        if (next && prev === totalPages) return prev;
        if (!next && prev === 1) return prev;

        return next ? prev + 1 : prev - 1;
      });
    }

    setLoadedCars(result.data);
  };

  console.log("loadedCars", loadedCars);

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
          // window.location.reload();
          handlePagination({ next: null });
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
        <h3 className="mb-2 mt-4">
          Cars List are shown below, we can edit them as we like
        </h3>

        <div className="flex gap-2 mb-4">
          <Btn
            onPress={() => {
              router.push({
                pathname: router.pathname,
                query: { ...router.query, filter: "approved" },
              });
              handlePagination({ page: 1, filter: "approved" });
            }}
            size="sm"
            intent="clear"
          >
            Approved Only
          </Btn>
          <Btn
            onPress={() => {
              router.push({
                pathname: router.pathname,
                query: { ...router.query, filter: "rejected" },
              });
              handlePagination({ page: 1, filter: "rejected" });
            }}
            size="sm"
            intent="clear"
          >
            Rejected Only
          </Btn>
          <Btn
            onPress={() => {
              delete router.query.filter;
              router.push({
                pathname: router.pathname,
                query: router.query,
              });
              handlePagination({ page: 1 });
            }}
            size="sm"
            intent="clear"
          >
            All
          </Btn>
        </div>

        <CarsTable
          loadedCars={loadedCars}
          handleApproval={handleApproval}
          setShowEditModal={setShowEditModal}
          setDetailToEdit={setDetailToEdit}
        />
        <div className="mt-4 flex justify-center pb-20 items-center gap-4">
          <Btn
            isDisabled={currentPage === 1}
            onPress={() => handlePagination({ next: false })}
          >
            Prev
          </Btn>
          <p>Current Page: {currentPage}</p>
          <Btn
            isDisabled={totalPages === currentPage}
            onPress={() => handlePagination({ next: true })}
          >
            Next
          </Btn>
        </div>
      </div>
    </div>
  );
}

type CarsTableProps = {
  loadedCars: Car[];
  handleApproval: (
    id: string,
    approval: "approved" | "rejected"
  ) => Promise<void>;
  setShowEditModal: Dispatch<
    SetStateAction<{
      success?: boolean;
      id: string;
    } | null>
  >;
  setDetailToEdit: Dispatch<SetStateAction<string>>;
};
const CarsTable = ({
  loadedCars,
  handleApproval,
  setShowEditModal,
  setDetailToEdit,
}: CarsTableProps) => {
  return (
    <div className="rounded-xl overflow-hidden border border-black/30">
      <table className="w-full">
        <tbody>
          <tr className="">
            <th className="text-left p-2">Approved</th>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">details</th>
            <th className="text-left p-2">Actions</th>
          </tr>
          {loadedCars.map((item) => {
            return (
              <tr className="bg-white" key={item.id}>
                <td className="p-2">
                  <div
                    className={`${
                      item.approval === "approved"
                        ? "bg-green-500"
                        : "bg-red-500"
                    } size-6 rounded-full`}
                  >
                    {/* {item.approval} */}
                  </div>
                </td>
                <td className="p-2">
                  {item.id}.&nbsp;{item.name}
                </td>
                <td className="p-2">{item.details}</td>
                <td className="p-2 flex gap-2">
                  <Btn
                    onPress={() => handleApproval(item.id, "approved")}
                    size="sm"
                    isDisabled={item.approval == "approved"}
                  >
                    Approve
                  </Btn>
                  <Btn
                    onPress={() => handleApproval(item.id, "rejected")}
                    size="sm"
                    intent="danger"
                    isDisabled={item.approval == "rejected"}
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
  );
};
