import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return redirect("/join");
  const user = await verifyLogin(token);
  if (!user) return redirect("/join");

  return createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo: "/notes",
  });
  return json({});
};
