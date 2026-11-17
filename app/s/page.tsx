import type { Metadata } from "next"

import { SharedSessionView } from "@/components/shared-session"

export const metadata: Metadata = {
  title: "Plano compartilhado — Round Logger",
  description: "Visualização somente leitura de um treino do Round Logger.",
}

// Link curto: /s#<treino comprimido>. O treino vive no hash, então nunca chega a um servidor.
export default function ShortSharedSessionPage() {
  return <SharedSessionView />
}
