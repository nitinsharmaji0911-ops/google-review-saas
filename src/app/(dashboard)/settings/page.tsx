"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  Store,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";
import { CATEGORIES, getCategoryById } from "@/lib/categories";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Business Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("cafe");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#0f172a");
  const [phone, setPhone] = useState("");

  // Lists
  const [services, setServices] = useState<string[]>([]);
  const [positiveTopics, setPositiveTopics] = useState<string[]>([]);
  const [issueTopics, setIssueTopics] = useState<string[]>([]);

  // Inputs
  const [newService, setNewService] = useState("");
  const [newPositiveTopic, setNewPositiveTopic] = useState("");
  const [newIssueTopic, setNewIssueTopic] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/business/me");
        const data = await res.json();
        if (data.success && data.business) {
          const b = data.business;
          setName(b.name || "");
          setCategory(b.category || "cafe");
          setLocation(b.location || "");
          setDescription(b.description || "");
          setGoogleReviewUrl(b.googleReviewUrl || "");
          setBrandColor(b.brandColor || "#0f172a");
          setPhone(b.phone || "");

          if (b.services) setServices(b.services.map((s: any) => s.name));
          if (b.topics) {
            setPositiveTopics(b.topics.filter((t: any) => t.type === "positive").map((t: any) => t.name));
            setIssueTopics(b.topics.filter((t: any) => t.type === "issue").map((t: any) => t.name));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategoryChange = (newCatId: string) => {
    setCategory(newCatId);
    const cat = getCategoryById(newCatId);
    if (confirm(`Load default services & topics for "${cat.name}"?`)) {
      setServices([...cat.defaultServices]);
      setPositiveTopics([...cat.positiveTopics]);
      setIssueTopics([...cat.issueTopics]);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleAddPositiveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPositiveTopic.trim() && !positiveTopics.includes(newPositiveTopic.trim())) {
      setPositiveTopics([...positiveTopics, newPositiveTopic.trim()]);
      setNewPositiveTopic("");
    }
  };

  const handleRemovePositiveTopic = (index: number) => {
    setPositiveTopics(positiveTopics.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const allTopics = [
        ...positiveTopics.map((name) => ({ name, type: "positive" })),
        ...issueTopics.map((name) => ({ name, type: "issue" })),
      ];

      const res = await fetch("/api/business/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          location,
          description,
          googleReviewUrl,
          brandColor,
          phone,
          services,
          topics: allTopics,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Keywords & Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your target search keywords, experience tags, and Google Business review URL.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Profile Info */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-700" /> Business Profile
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Your public identity displayed to customers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 4th Cross, Indiranagar, Bengaluru"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Google Review URL */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-600" /> Google Business Profile Review URL
              </label>
              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-900 hover:underline inline-flex items-center gap-1"
                >
                  Test Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              type="url"
              required
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/your-id/review or https://search.google.com/local/writereview?placeid=..."
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-mono"
            />
            {googleReviewUrl && googleReviewUrl.trim().length > 5 && (
              <div className="mt-2 flex items-center justify-between bg-emerald-50/80 border border-emerald-200/70 px-3 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11.5px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Verify link destination</span>
                </div>
                <a
                  href={googleReviewUrl.startsWith("http") ? googleReviewUrl : `https://${googleReviewUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                >
                  <span>🧪 Test GMB Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Keywords & Experience Topics Manager */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Positive Experience Topics */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Experience Praise Topics
              </h3>
              <p className="text-[11px] text-slate-400">Tags customers can select when writing reviews.</p>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[80px] p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
              {positiveTopics.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white text-slate-900 font-medium px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemovePositiveTopic(idx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPositiveTopic}
                onChange={(e) => setNewPositiveTopic(e.target.value)}
                placeholder="e.g. Friendly Baristas"
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleAddPositiveTopic}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Services / Menu Items */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-600" /> Target Keyword Services
              </h3>
              <p className="text-[11px] text-slate-400">Products & items to boost Google Search rankings.</p>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[80px] p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl">
              {services.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white text-slate-900 font-medium px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs flex items-center gap-1.5"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="e.g. Sourdough Toast"
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Settings saved!
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            {saving ? "Saving..." : (
              <>
                <Save className="w-4 h-4" /> Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
