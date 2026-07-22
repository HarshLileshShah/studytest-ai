"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteDocument } from "@/app/actions/document.actions";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteDocument(documentId);
    if (result.success) {
      router.push("/documents");
    } else {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-1 text-xs"
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          }}
        >
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Confirm Delete"
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="btn-ghost text-xs"
          disabled={isDeleting}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  );
}
