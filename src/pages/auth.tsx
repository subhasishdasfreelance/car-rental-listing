import { Btn } from "@/ui/Btn";
import Modal from "@/ui/Modal";
import TextField from "@/ui/TextField";
import { parse } from "cookie";
import { GetServerSideProps } from "next";
import { useReducer, useState } from "react";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const cookies = parse(req.headers.cookie || "");
    if (cookies.token !== process.env.TOKEN) {
      return {
        props: {
          loggedIn: false,
        },
      };
    }

    return {
      props: {
        loggedIn: true,
      },
    };
  } catch (err) {
    console.log("err", err);
    return {
      props: {
        loggedIn: false,
      },
    };
  }
};

const initialFormState = {
  email: "",
  password: "",
};
export default function Login({ loggedIn }: { loggedIn: boolean }) {
  const [formState, updateFormState] = useReducer(
    (
      prev: Partial<typeof initialFormState>,
      next: Partial<typeof initialFormState>
    ) => ({
      ...prev,
      ...next,
    }),
    initialFormState
  );

  const [showConfirmModal, setShowConfirmModal] = useState<null | {
    success?: boolean;
    header: string;
    msg: string;
  }>(null);

  const handleLogin = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: JSON.stringify(formState),
    });

    const result = await response.json();
    console.log("result", result);
    setShowConfirmModal({
      success: true,
      header: "Message Submitted!",
      msg: "Your message is successfully sent. You'll be contacted through email shortly!",
    });

    updateFormState({ email: "", password: "" });
  };

  const handleLogout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
      },
      body: JSON.stringify(formState),
    });

    const result = await response.json();
    console.log("result", result);
    setShowConfirmModal({
      success: true,
      header: "Message Submitted!",
      msg: "Your message is successfully sent. You'll be contacted through email shortly!",
    });

    updateFormState({ email: "", password: "" });
  };

  return (
    <div className="max-w-7xl mx-auto pt-[4.5rem]">
      <div className="container mx-auto px-4">
        <Modal
          success={showConfirmModal?.success}
          isOpen={showConfirmModal !== null}
          onClose={() => {
            setShowConfirmModal(null);
            window.location.reload();
          }}
          header={showConfirmModal?.header || ""}
        >
          {showConfirmModal?.msg || ""}
        </Modal>

        {!loggedIn ? (
          <div className="max-w-lg flex flex-col items-end gap-4">
            <TextField
              value={formState.email || ""}
              onChange={(ev) => updateFormState({ email: ev.target.value })}
              label="Email"
            />
            <TextField
              value={formState.password || ""}
              onChange={(ev) => updateFormState({ password: ev.target.value })}
              label="password"
              type="password"
            />
            <Btn onPress={handleLogin}>Login</Btn>
          </div>
        ) : (
          <div className="">
            <h3 className="mb-4">Already logged in</h3>
            <Btn onPress={handleLogout}>Logout</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
