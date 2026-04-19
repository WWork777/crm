"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addContract(formData: FormData) {
  const counterpartyId = formData.get("counterpartyId") as string;
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const fileUrl = formData.get("fileUrl") as string; // Здесь будет ссылка на файл

  await prisma.contract.create({
    data: {
      title,
      counterpartyId,
      date: date ? new Date(date) : null,
      fileUrl: fileUrl || null,
    },
  });

  revalidatePath("/counterparties");
}
