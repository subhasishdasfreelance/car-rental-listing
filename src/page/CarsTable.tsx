import { Car } from "@/pages/api/car-list";
import { Btn } from "@/ui/Btn";
import { Dispatch, SetStateAction } from "react";

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

export default CarsTable;
