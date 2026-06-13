"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-outline print:hidden"
    >
      🖨️ Imprimir / PDF
    </button>
  );
}
