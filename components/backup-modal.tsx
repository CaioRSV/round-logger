"use client"

import { AlertCircle, Check, Download, FileJson, Upload, X } from "lucide-react"
import { useRef, useState } from "react"

import { downloadBackupFile, importBackupData, type ImportResult } from "@/lib/storage"
import type { Session } from "@/lib/types"

interface BackupModalProps {
  sessionsCount: number
  onClose: () => void
  onImportSuccess: (sessions: Session[], profileUpdated?: boolean) => void
}

export function BackupModal({ sessionsCount, onClose, onImportSuccess }: BackupModalProps) {
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    setIsExporting(true)
    try {
      downloadBackupFile()
    } finally {
      setTimeout(() => setIsExporting(false), 800)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
    }
    reader.readAsText(file)
  }

  function handleConfirmImport() {
    if (!fileContent) return
    const res = importBackupData(fileContent)
    setResult(res)
    if (res.success) {
      // Reload sessions into parent state
      const { loadSessions } = require("@/lib/storage")
      onImportSuccess(loadSessions(), res.profileUpdated)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div className="modal-head">
          <div>
            <div className="section-kicker">GERENCIAR DADOS</div>
            <h2 id="backup-title">Backup & Cache Local</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <p style={{ color: "#a5a99f", fontSize: "11px", lineHeight: "1.6", margin: "10px 0 20px" }}>
          Seus dados são salvos com segurança no cache deste navegador (localStorage).
          Você pode exportar um backup a qualquer momento para guardar em seu computador ou importar em outro aparelho.
        </p>

        <div style={{ display: "grid", gap: "16px" }}>
          {/* Export section */}
          <div
            style={{
              padding: "16px",
              borderRadius: "6px",
              border: "1px solid #332321",
              background: "linear-gradient(135deg, #1f1817, #171816)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#f2eae7", display: "flex", alignItems: "center", gap: "6px" }}>
                <Download size={15} style={{ color: "#d4f36a" }} /> Exportar backup
              </div>
              <small style={{ color: "#8a8f85", fontSize: "10px", marginTop: "4px", display: "block" }}>
                Baixa um arquivo JSON com seus {sessionsCount} treino(s) e tipos de exercícios.
              </small>
            </div>
            <button
              type="button"
              className="top-create"
              onClick={handleExport}
              style={{ height: "32px", fontSize: "11px", whiteSpace: "nowrap" }}
            >
              {isExporting ? "Exportando…" : "Baixar .JSON"}
            </button>
          </div>

          {/* Import section */}
          <div
            style={{
              padding: "16px",
              borderRadius: "6px",
              border: "1px solid #2d312c",
              background: "#161816",
              display: "grid",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#f2eae7", display: "flex", alignItems: "center", gap: "6px" }}>
                <Upload size={15} style={{ color: "#ed665d" }} /> Importar backup
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              <button
                type="button"
                className="cancel-btn"
                style={{ height: "30px", fontSize: "11px", padding: "0 10px" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileJson size={14} style={{ marginRight: "5px" }} />
                {fileName ? "Trocar arquivo" : "Selecionar .JSON"}
              </button>
            </div>

            {fileName && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#1e211e",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #363b34",
                  fontSize: "11px",
                }}
              >
                <span style={{ color: "#dfe2db" }}>{fileName}</span>
                <button
                  type="button"
                  className="top-create"
                  style={{ height: "28px", fontSize: "10px", padding: "0 10px" }}
                  onClick={handleConfirmImport}
                >
                  Confirmar importação
                </button>
              </div>
            )}

            {result && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: `1px solid ${result.success ? "#496828" : "#682e28"}`,
                  background: result.success ? "#1f2918" : "#2b1918",
                  color: result.success ? "#c7e88b" : "#f18d81",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {result.success ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{result.message}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: "24px" }}>
          <button className="cancel-btn" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </section>
    </div>
  )
}
