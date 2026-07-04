"use client";

import { useState } from "react";
import { submitReview } from "./actions";
import { CheckCircle, XCircle, Send, Loader2 } from "lucide-react";
import { useAlert } from "@/components/AlertProvider";

interface ReviewFormProps {
  skillId: string;
  initialStatus: string;
}

export function ReviewForm({ skillId, initialStatus }: ReviewFormProps) {
  const [status, setStatus] = useState<string>("APPROVE");
  const [isPending, setIsPending] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      const res = await submitReview(formData);
      if (res?.success) {
        showAlert({ type: "success", message: "Review successfully submitted!" });
        // Optional: you can redirect using useRouter here if you want
        window.location.href = "/review/queue";
      }
    } catch (error) {
      console.error(error);
      showAlert({ type: "error", message: "Failed to submit review. Please try again." });
      setIsPending(false);
    }
  };

  if (initialStatus !== "IN_REVIEW") {
    return (
      <div className="p-4 md:p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[var(--studio-text)]">Review Status</h3>
        <p className="text-sm text-zinc-500">
          This skill has already been reviewed and is currently marked as <strong>{initialStatus}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="p-4 md:p-5">
      <div>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-[var(--studio-text)]">Submit Review</h3>
        <input type="hidden" name="skillId" value={skillId} />
        
        <div className="review-radio-group mb-6">
          <label className={`review-radio-label ${status === "APPROVE" ? "selected" : ""}`}>
            <input 
              type="radio" 
              name="status" 
              value="APPROVE"
              checked={status === "APPROVE"}
              onChange={() => setStatus("APPROVE")}
              className="review-radio-input"
            />
            <CheckCircle className={status === "APPROVE" ? "text-green-500" : "text-zinc-400"} size={18} />
            <span className="font-medium text-sm">Approve & Publish</span>
          </label>

          <label className={`review-radio-label ${status === "REJECT" ? "selected" : ""}`}>
            <input 
              type="radio" 
              name="status" 
              value="REJECT"
              checked={status === "REJECT"}
              onChange={() => setStatus("REJECT")}
              className="review-radio-input"
            />
            <XCircle className={status === "REJECT" ? "text-red-500" : "text-zinc-400"} size={18} />
            <span className="font-medium text-sm">Reject / Request Changes</span>
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Reviewer Note (Markdown)
          </label>
          <textarea 
            name="noteMarkdown"
            className="review-textarea"
            placeholder="Provide feedback or reasons for your decision..."
            required={status === "REJECT"}
          ></textarea>
          {status === "REJECT" && (
            <p className="text-xs text-red-500 mt-1">Note is required when rejecting.</p>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        className="review-btn w-full"
        disabled={isPending}
      >
        {isPending ? (
          <><Loader2 size={16} className="animate-spin" /> Submitting...</>
        ) : (
          <><Send size={16} /> Submit Review</>
        )}
      </button>
    </form>
  );
}
