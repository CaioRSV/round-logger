"use client"

import { Camera, Trash2, User, X } from "lucide-react"
import { useRef, useState } from "react"

import type { UserProfile } from "@/lib/types"

interface ProfileModalProps {
  profile: UserProfile
  onClose: () => void
  onSave: (profile: UserProfile) => void
}

export function ProfileModal({ profile, onClose, onSave }: ProfileModalProps) {
  const [name, setName] = useState(profile.name)
  const [subtitle, setSubtitle] = useState(profile.subtitle ?? "Log pessoal")
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to image files
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      // Resize to max 256x256 to keep localStorage small and fast
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const size = Math.min(img.width, img.height)
        canvas.width = 128
        canvas.height = 128
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Draw centered square crop
          const offsetX = (img.width - size) / 2
          const offsetY = (img.height - size) / 2
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 128, 128)
          const resized = canvas.toDataURL("image/jpeg", 0.85)
          setAvatarUrl(resized)
        } else {
          setAvatarUrl(src)
        }
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      name: name.trim() || "Meu espaço",
      subtitle: subtitle.trim() || "Log pessoal",
      avatarUrl: avatarUrl || undefined,
    })
    onClose()
  }

  const initial = name.trim().charAt(0).toUpperCase() || "C"

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "460px" }}
      >
        <div className="modal-head">
          <div>
            <div className="section-kicker">PERFIL PESSOAL</div>
            <h2 id="profile-title">Meu Espaço</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar upload & preview */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px 0",
              borderBottom: "1px solid #282c27",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#2f3724",
                border: "2px solid #485b34",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "24px", fontWeight: "700", color: "#d4f36a" }}>
                  {initial}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#f0f2ed" }}>
                Foto de perfil
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="cancel-btn"
                  style={{ height: "30px", fontSize: "10px", padding: "0 10px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={13} /> Escolher foto
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    className="cancel-btn"
                    style={{ height: "30px", fontSize: "10px", padding: "0 8px", color: "#ed7063" }}
                    onClick={() => setAvatarUrl(undefined)}
                    title="Remover foto"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <small style={{ color: "#7b8178", fontSize: "9px" }}>
                PNG, JPG ou WEBP. Salva com segurança no navegador.
              </small>
            </div>
          </div>

          {/* Form fields */}
          <div className="modal-fields" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px", padding: "16px 0" }}>
            <label>
              <span>SEU NOME / APELIDO</span>
              <input
                type="text"
                placeholder="Ex: Caio, Guerreiro..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
              />
            </label>

            <label>
              <span>SUBTÍTULO / MODALIDADE OU STATUS</span>
              <input
                type="text"
                placeholder="Ex: Muay Thai · Peso Leve, Boxeador..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={50}
              />
            </label>
          </div>

          {/* Preview of sidebar look */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "6px",
              background: "#141614",
              border: "1px solid #282c28",
              display: "flex",
              alignItems: "center",
              gap: "11px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#2f3724",
                color: "#d4f36a",
                display: "grid",
                placeItems: "center",
                fontWeight: "700",
                fontSize: "13px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                initial
              )}
            </div>
            <div>
              <b style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#eeefec" }}>
                {name || "Meu espaço"}
              </b>
              <small style={{ display: "block", color: "#777c74", fontSize: "10px", marginTop: "2px" }}>
                {subtitle || "Log pessoal"}
              </small>
            </div>
            <span style={{ marginLeft: "auto", fontSize: "9px", color: "#666b63", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Prévia
            </span>
          </div>

          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="top-create" type="submit">
              Salvar perfil
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
