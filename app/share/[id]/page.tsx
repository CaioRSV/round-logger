import type { Metadata } from "next"

import { SharedSessionView } from "@/components/shared-session"

export const metadata: Metadata = {
  title: "Plano compartilhado — Round Logger",
  description: "Visualização somente leitura de um treino do Round Logger.",
}

export default async function SharedSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SharedSessionView id={id} />
}
