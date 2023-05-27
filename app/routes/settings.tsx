import { ActionArgs, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { Confirm, useConfirmModal } from "~/components/ErrorHandling/Confirm";
import Button from "~/components/UI/Button";
import Input from "~/components/UI/Input";
import { authenticator } from "~/server/auth/auth.server";
import { logout } from "~/server/auth/logout.server";
import {
  deleteProfile,
  updatePassword,
  updateUsername,
} from "~/server/auth/services.server";

export default function Settings() {
  const data = useActionData();
  // const { delmod, isConfirmed, setIsConfirmed, handleDeleteModal } =
  //   useConfirmModal();

  return (
    <div className="flex flex-col w-full items-center justify-evenly">
      <h1 className="text-2xl md:text-3xl text-darkAccent dark:text-primary font-bold m-6">
        Settings
      </h1>

      <Form
        method="put"
        className="flex flex-col justify-center items-center p-2 w-3/4 md:w-1/2 bg-darkAccent dark:bg-primary mb-3"
      >
        <h2 className="text-primary dark:text-darkAccent">Change Username</h2>
        <input type="hidden" name="action" value="updusername" />

        {data?.message1 && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg">
            {data.message1}
          </span>
        )}

        {data?.success1 && (
          <span className="bg-bcd text-accent m-2 p-2 font-bold italic rounded-lg">
            {data.success1}
          </span>
        )}

        <Input
          type="password"
          label="Enter Current Password"
          id="cpassword"
          classnm="dark:text-darkAccent text-primary dark:border-darkAccent border-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Input
          type="text"
          label="Enter New Username"
          id="nusername"
          classnm="dark:text-darkAccent text-primary dark:border-darkAccent border-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Button
          type="submit"
          className="p-3 bg-primary text-darkAccent dark:bg-darkAccent dark:text-primary rounded-sm"
        >
          Update Username
        </Button>
      </Form>

      <Form
        method="put"
        className="flex flex-col justify-center items-center p-2 w-3/4 md:w-1/2 bg-darkAccent dark:bg-primary mb-3"
      >
        <h2 className="text-primary dark:text-darkAccent">Change Password</h2>

        {data?.message2 && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg">
            {data.message2}
          </span>
        )}

        {data?.success2 && (
          <span className="bg-bcd text-accent m-2 p-2 font-bold italic rounded-lg">
            {data.success2}
          </span>
        )}

        <input type="hidden" name="action" value="updpass" />

        <Input
          type="password"
          label="Enter Current Password"
          id="crpassword"
          classnm="dark:text-darkAccent text-primary dark:border-darkAccent border-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Input
          type="password"
          label="Enter New Password"
          id="npassword"
          classnm="dark:text-darkAccent text-primary dark:border-darkAccent border-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Input
          type="password"
          label="Confirm Password"
          id="confirmp"
          classnm="dark:text-darkAccent text-primary dark:border-darkAccent border-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Button
          type="submit"
          className="p-3 bg-primary text-darkAccent dark:bg-darkAccent dark:text-primary rounded-sm"
        >
          Update Password
        </Button>
      </Form>

      <Form
        method="delete"
        onSubmit={(event) => {
          if (!confirm("Are you sure?")) {
            event.preventDefault();
          }
        }}
        className="flex flex-col justify-center items-center p-2 w-3/4 md:w-1/2 bg-darkAccent dark:bg-primary mb-3"
      >
        <h2 className="text-error underline font-bold">Erase Data</h2>
        <input type="hidden" name="action" value="delprofile" />

        {data?.message3 && (
          <span className="bg-error text-primary m-2 p-2 font-semibold rounded-lg">
            {data.message3}
          </span>
        )}

        <Input
          type="password"
          label="Enter Current Password"
          id="cdpassword"
          classnm="dark:text-darkAccent text-primary dark:border-darkAccent border-primary"
          classlabel="dark:text-darkAccent text-primary"
        />

        <Button type="submit" className="p-3 bg-error text-primary rounded-sm">
          Delete Profile
        </Button>
        {/* {delmod && (
          <Confirm
            onBackdropClick={handleDeleteModal}
            confirm={setIsConfirmed}
            question="Are you sure you want to delete you account?"
          />
        )} */}
      </Form>
    </div>
  );
}

export async function action(args: ActionArgs) {
  const user = await authenticator.isAuthenticated(args.request, {
    failureRedirect: "/login",
  });

  const data = await args.request.formData();
  if (data.get("action")?.toString() === "updusername") {
    const password = data.get("cpassword")?.toString().replace(/ /g, "");
    const newUsername = data.get("nusername")?.toString().replace(/ /g, "");

    if (!password || !newUsername)
      return { message1: "All fields are required" };

    if (newUsername.length > 12)
      return { message1: "Username too long. Must be less than 12 characters" };

    if (newUsername.length <= 0 || password.length <= 0)
      return { message1: "Form is incomplete. Fill every field correctly" };

    const response = await updateUsername(newUsername, user.id, password);

    if (response.isError())
      return { ...response.error, message1: response.error.message };

    return { success1: "Username Updated" };
  }

  if (data.get("action")?.toString() === "updpass") {
    const password = data.get("crpassword")?.toString().replace(/ /g, "");
    const newPassword = data.get("npassword")?.toString().replace(/ /g, "");
    const confirm = data.get("confirmp")?.toString().replace(/ /g, "");

    if (!password || !newPassword || !confirm)
      return { message2: "All fields are required" };

    if (newPassword !== confirm) return { message2: "Passwords do not match!" };

    const response = await updatePassword(password, newPassword, user.id);

    if (response.isError())
      return { ...response.error, message2: response.error.message };

    return { success2: "Password Updated" };
  }

  if (data.get("action")?.toString() === "delprofile") {
    const password = data.get("cdpassword")?.toString().replace(/ /g, "");

    if (!password) return { message3: "All fields are required" };

    const response = await deleteProfile(user.id, password);

    if (response.isError())
      return { ...response.error, message3: response.error.message };

    const deletedUser = response.value;

    return await logout(args);
  }
}
