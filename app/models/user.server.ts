import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as stytch from "stytch";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";
const { STYTCH_PROJECT_ID, STYTCH_SECRET } = process.env;
if (!STYTCH_PROJECT_ID || !STYTCH_SECRET) {
  throw new Error("Missing STYTCH_PROJECT_ID or STYTCH_SECRET");
}

const client = new stytch.Client({
  project_id: STYTCH_PROJECT_ID,
  secret: STYTCH_SECRET,
  env: stytch.envs.test,
});

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"]) {
  const result = await client.magicLinks.email.loginOrCreate({
    email,
  });
  if (result.user_created) {
    await prisma.user.create({ data: { email } });
  }
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(token: string) {
  try {
    const authResponse = await client.magicLinks.authenticate(token);
    const isValid = authResponse.user;
    const user = await prisma.user.findUnique({
      where: { email: authResponse.user.emails[0].email },
    });

    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
}
