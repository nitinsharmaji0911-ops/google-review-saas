"use client";

import React, { useState } from "react";
import { MessageSquare, Calendar, Phone, User } from "lucide-react";

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
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: "f1",
      customerName: "Rahul Sharma",
      customerPhone: "+91 98765 43210",
      customerEmail: "rahul@example.com",
      message: "Loved the cappuccino! Just a small note: the AC near table 4 was blowing directly cold air today. Everything else was awesome.",
      issueTopics: JSON.stringify(["Seating Availability", "Temperature"]),
      status: "unread",
      createdAt: "Today at 2:15 PM",
    },
    {
      id: "f2",
      customerName: "Pooja Verma",
      customerPhone: "+91 98111 22334",
      customerEmail: "",
      message: "Waited about 15 minutes for the sandwich during Sunday brunch rush. Food was delicious though!",
      issueTopics: JSON.stringify(["Waiting Time"]),
      status: "resolved",
      createdAt: "Yesterday at 11:30 AM",
    },
  ]);

  const toggleStatus = (id: string) => {
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === "unread" ? "resolved" : "unread" } : f
      )
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Private Customer Feedback</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Messages sent directly to management by customers who wanted to provide private suggestions or report issues.
        </p>
      </div>

      <div className="space-y-3.5">
        {feedbacks.map((item) => {
          let issues: string[] = [];
          try {
            if (item.issueTopics) issues = JSON.parse(item.issueTopics);
          } catch {}

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
                    <Calendar className="w-3 h-3" /> {item.createdAt}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-xl border transition-all ${
                    item.status === "unread"
                      ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {item.status === "unread" ? "Mark Resolved" : "Mark Unread"}
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
    </div>
  );
}
