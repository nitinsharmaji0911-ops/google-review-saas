"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function PrivateFeedbackPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [businessName, setBusinessName] = useState("the management");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [issueTopics, setIssueTopics] = useState<string[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch(`/api/business/${slug}`);
        const data = await res.json();
        if (data.success && data.business) {
          setBusinessName(data.business.name);
          setGoogleReviewUrl(data.business.googleReviewUrl);
          const issues = data.business.topics?.filter((t: any) => t.type === "issue") || [];
          setIssueTopics(issues.map((i: any) => i.name));
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (slug) loadBusiness();
  }, [slug]);

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: slug,
          customerName: name,
          customerPhone: phone,
          message,
          issueTopics: selectedIssues,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg flex flex-col justify-between items-center py-6 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-4">
          <Link
            href={`/r/${slug}`}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Review Screen
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">How can we do better?</h1>
                <p className="text-xs text-slate-500">
                  Your feedback goes directly to the owner of <span className="font-semibold text-slate-700">{businessName}</span>.
                </p>
              </div>

              {issueTopics.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    What didn't meet expectations? (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {issueTopics.map((topic) => {
                      const isSelected = selectedIssues.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleIssue(topic)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                            isSelected
                              ? "bg-rose-50 border-rose-300 text-rose-700 font-semibold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What happened? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please tell us what went wrong so we can fix it right away..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {submitting ? "Submitting..." : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Private Message to Owner
                  </>
                )}
              </button>

              {/* Policy compliance: Unconditional access to public Google reviews */}
              {googleReviewUrl && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <p className="text-[11px] text-slate-400">
                    Prefer to post on Google directly?{" "}
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      Open Google Review <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </p>
                </div>
              )}
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Thank You for Letting Us Know</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                We've received your note and will review it with our team to ensure we make it right.
              </p>
              <div className="pt-4">
                <Link
                  href={`/r/${slug}`}
                  className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100"
                >
                  Return to Main Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-[11px] text-slate-400">
          Welurik Review Customer Care System
        </p>
      </div>
    </div>
  );
}
