"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar, Phone, User, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface FeedbackItem {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  message: string;
  issueTopics?: string;
  status: string;
  createdAt: string;
}

export default function FeedbackInboxPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/feedback");
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbacks(data.feedback || []);
      } else {
        setError(data.error || "Failed to load feedback inbox");
      }
    } catch {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "unread" ? "resolved" : "unread";

    // Optimistic UI update
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: nextStatus } : f))
    );

    try {
      setUpdatingId(id);
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revert on failure
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: currentStatus } : f))
        );
      }
    } catch {
      // Revert on failure
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: currentStatus } : f))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Private Customer Feedback</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real feedback and suggestions submitted privately through your customer review funnel.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-xs font-semibold">Loading your customer feedback...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchFeedback}
            className="underline font-bold hover:text-rose-900 ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && feedbacks.length === 0 && (
        <div className="bg-white rounded-[28px] border border-slate-200/80 p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Your Feedback Inbox is Clear!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              When customers rate 1–3 stars on your standee or table tents, their private feedback and contact details will appear here.
            </p>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {!loading && !error && feedbacks.length > 0 && (
        <div className="space-y-3.5">
          {feedbacks.map((item) => {
            let issues: string[] = [];
            if (item.issueTopics) {
              if (Array.isArray(item.issueTopics)) {
                issues = item.issueTopics;
              } else if (typeof item.issueTopics === "string") {
                try {
                  const parsed = JSON.parse(item.issueTopics);
                  issues = Array.isArray(parsed) ? parsed : [item.issueTopics];
                } catch {
                  issues = item.issueTopics.split(",").map((s: string) => s.trim()).filter(Boolean);
                }
              }
            }

            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recent";

            return (
              <div
                key={item.id}
                className={`bg-white rounded-[24px] border p-5 transition-all shadow-xs ${
                  item.status === "unread"
                    ? "border-amber-200 bg-amber-50/10"
                    : "border-slate-200/80 opacity-75"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        item.status === "unread"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {item.status === "unread" ? "Needs Attention" : "Resolved"}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formattedDate}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`text-xs font-semibold px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                      item.status === "unread"
                        ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : item.status === "unread" ? (
                      "Mark Resolved"
                    ) : (
                      "Mark Unread"
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-800 font-normal leading-relaxed mb-3">
                  "{item.message}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    {item.customerName && (
                      <span className="text-slate-700 font-semibold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {item.customerName}
                      </span>
                    )}
                    {item.customerPhone && (
                      <a
                        href={`tel:${item.customerPhone}`}
                        className="text-slate-900 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {item.customerPhone}
                      </a>
                    )}
                    {item.customerEmail && (
                      <a
                        href={`mailto:${item.customerEmail}`}
                        className="text-slate-600 hover:underline text-[11px]"
                      >
                        {item.customerEmail}
                      </a>
                    )}
                  </div>

                  {issues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {issues.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
