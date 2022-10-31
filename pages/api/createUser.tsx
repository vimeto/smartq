

import prisma from "../../lib/prisma";
import bcryptjs from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).send({ message: "Only POST allowed" }); return;
  }

  const body = req.body;

  const { name, username, email, password } = body;

  if (!String(name) || !String(username) || !String(email) || !String(password)) {
    res.status(400).send({ message: "Required attribute missing" }); return;
  }

  if (await prisma.user.findUnique({ where: { username: String(username) } })) {
    res.status(400).send({ message: "Username already in use" }); return;
  }

  const passwordDigest = await bcryptjs.hash(String(password), 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name: String(name),
        username: String(username),
        email: String(email),
        passwordDigest,
      }
    });

    res.status(200).json({ user: newUser }); return;
  } catch {
    res.json(500).send({ message: 'smth happened, try again' });
  }
}
