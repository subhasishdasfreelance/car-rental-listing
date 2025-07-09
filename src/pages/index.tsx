import db from "@/lib/db";
import CarsTable from "@/page/CarsTable";
import { Btn } from "@/ui/Btn";
import Modal from "@/ui/Modal";
import TextField from "@/ui/TextField";
import { parse } from "cookie";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { Car } from "./api/car-list";

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
