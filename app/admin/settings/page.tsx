"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "./actions";
import { useToast } from "@/lib/stores/toast.store";
import { Plus, X, Save, Settings2, Sparkles } from "lucide-react";
import { aiTranslateAction } from "../actions/ai_actions";

export default function SettingsPage() {
    const [placeholders, setPlaceholders] = useState<string[]>([]);
    const [announcementActive, setAnnouncementActive] = useState(false);
    const [announcementBgColor, setAnnouncementBgColor] = useState("#000000");
    const [announcementTextColor, setAnnouncementTextColor] = useState("#ffffff");
    const [announcementSpeed, setAnnouncementSpeed] = useState(30);
    const [announcementItems, setAnnouncementItems] = useState<any[]>([]);
    const [isTranslating, setIsTranslating] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        async function load() {
            const data = await getSiteSettings();
            if (data) {
                setPlaceholders(data.searchPlaceholders);
                setAnnouncementActive(data.announcementActive);
                setAnnouncementBgColor(data.announcementBgColor || "#000000");
                setAnnouncementTextColor(data.announcementTextColor || "#ffffff");
                setAnnouncementSpeed(data.announcementSpeed || 30);
                setAnnouncementItems(Array.isArray(data.announcementItems) ? data.announcementItems : []);
            }
            setLoading(false);
        }
        load();
    }, []);

    const addPlaceholder = () => {
        setPlaceholders([...placeholders, ""]);
    };

    const removePlaceholder = (index: number) => {
        setPlaceholders(placeholders.filter((_, i) => i !== index));
    };

    const updatePlaceholder = (index: number, value: string) => {
        const newOnes = [...placeholders];
        newOnes[index] = value;
        setPlaceholders(newOnes);
    };

    const addAnnouncementItem = () => {
        setAnnouncementItems([...announcementItems, { text_uk: "", text_ru: "", text_pl: "", text_en: "", link: "" }]);
    };

    const removeAnnouncementItem = (index: number) => {
        setAnnouncementItems(announcementItems.filter((_, i) => i !== index));
    };

    const updateAnnouncementItem = (index: number, field: string, value: string) => {
        const newOnes = [...announcementItems];
        newOnes[index] = { ...newOnes[index], [field]: value };
        setAnnouncementItems(newOnes);
    };

    const handleAnnouncementAiTranslate = async (index: number) => {
        const item = announcementItems[index];
        const sourceText = item.text_uk || item.text_en || item.text_ru || item.text_pl;

        if (!sourceText) {
            showToast("INPUT_PRIMARY_SOURCE_FIRST", "warning");
            return;
        }

        setIsTranslating(index);
        try {
            const result = await aiTranslateAction(sourceText);
            if (result.success && result.data) {
                const newItems = [...announcementItems];
                newItems[index] = {
                    ...newItems[index],
                    text_en: result.data.en || newItems[index].text_en,
                    text_uk: result.data.uk || newItems[index].text_uk,
                    text_ru: result.data.ru || newItems[index].text_ru,
                    text_pl: result.data.pl || newItems[index].text_pl,
                };
                setAnnouncementItems(newItems);
                showToast("AI_SYNC_COMPLETED", "success");
            } else {
                showToast("ERROR_UPDATING_SETTINGS", "error");
            }
        } catch (error) {
            showToast("ERROR_UPDATING_SETTINGS", "error");
        }
        setIsTranslating(null);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateSiteSettings({
            searchPlaceholders: placeholders.filter(p => p.trim() !== ""),
            announcementActive,
            announcementBgColor,
            announcementTextColor,
            announcementSpeed,
            announcementItems: announcementItems.filter(item => 
                item.text_uk.trim() || item.text_ru.trim() || item.text_pl.trim() || item.text_en.trim()
            )
        });
        
        if (result.success) {
            showToast("SETTINGS_UPDATED", "success");
        } else {
            showToast("ERROR_UPDATING_SETTINGS", "error");
        }
        setSaving(false);
    };

    if (loading) return <div className="p-12 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Loading_System_Config...</div>;

    return (
        <div className="py-12 px-6 max-w-4xl mx-auto">
            <div className="mb-12 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-black dark:bg-white" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">System_Configuration</h1>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-black/40 dark:text-white/40">
                    System Core // Global Config // v1.0.5
                </p>
            </div>

            <div className="space-y-12">
                {/* Announcement Bar Section */}
                <section className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-8 md:p-12 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Plus size={20} className="rotate-45" />
                                Announcement_Bar_Module
                            </h3>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-black/40">Manage global top announcement banner</p>
                        </div>
                        <label className="flex items-center gap-4 cursor-pointer">
                            <span className="text-[10px] font-black uppercase tracking-widest">{announcementActive ? "Active" : "Inactive"}</span>
                            <div 
                                onClick={() => setAnnouncementActive(!announcementActive)}
                                className={`w-12 h-6 rounded-full transition-all relative ${announcementActive ? "bg-black dark:bg-white" : "bg-black/10 dark:bg-white/10"}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${announcementActive ? "right-1 bg-white dark:bg-black" : "left-1 bg-black/40"}`} />
                            </div>
                        </label>
                    </div>

                    {announcementActive && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-500">
                            {/* Colors & Speed */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Background_Color</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="color" 
                                            value={announcementBgColor} 
                                            onChange={(e) => setAnnouncementBgColor(e.target.value)}
                                            className="w-12 h-12 bg-transparent cursor-pointer"
                                        />
                                        <input 
                                            type="text" 
                                            value={announcementBgColor} 
                                            onChange={(e) => setAnnouncementBgColor(e.target.value)}
                                            className="flex-1 bg-transparent border border-black/10 dark:border-white/10 px-4 py-3 text-xs font-bold font-mono text-black dark:text-white outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Text_Color</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="color" 
                                            value={announcementTextColor} 
                                            onChange={(e) => setAnnouncementTextColor(e.target.value)}
                                            className="w-12 h-12 bg-transparent cursor-pointer"
                                        />
                                        <input 
                                            type="text" 
                                            value={announcementTextColor} 
                                            onChange={(e) => setAnnouncementTextColor(e.target.value)}
                                            className="flex-1 bg-transparent border border-black/10 dark:border-white/10 px-4 py-3 text-xs font-bold font-mono text-black dark:text-white outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Marquee_Speed (0 = Static)</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            step="5"
                                            value={announcementSpeed === 0 ? 0 : 140 - announcementSpeed}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setAnnouncementSpeed(val === 0 ? 0 : 140 - val);
                                            }}
                                            className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                                        />
                                        <span className="w-12 text-center text-xs font-bold font-mono text-black dark:text-white">
                                            {announcementSpeed === 0 ? "OFF" : `${announcementSpeed}s`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white text-black/40">Announcement_Items</span>
                                    <button
                                        onClick={addAnnouncementItem}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                    >
                                        <Plus size={12} />
                                        Add_Item
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {announcementItems.map((item, i) => (
                                        <div key={i} className="p-6 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 space-y-4 relative group">
                                            <button 
                                                onClick={() => removeAnnouncementItem(i)}
                                                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                            >
                                                <X size={14} />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">UK (Українська)</label>
                                                        <button 
                                                            onClick={() => handleAnnouncementAiTranslate(i)}
                                                            disabled={isTranslating !== null}
                                                            className="flex items-center gap-1.5 px-2 py-0.5 bg-black/5 dark:bg-white/5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all rounded-sm group/ai"
                                                            title="Translate with AI"
                                                        >
                                                            <Sparkles size={10} className={isTranslating === i ? "animate-spin" : ""} />
                                                            <span className="text-[8px] font-black uppercase tracking-widest">AI_Translate</span>
                                                        </button>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={item.text_uk} 
                                                        onChange={(e) => updateAnnouncementItem(i, 'text_uk', e.target.value)}
                                                        placeholder="Введіть текст..."
                                                        className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 px-4 py-2 text-xs font-bold text-black dark:text-white outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">RU (Русский)</label>
                                                    <input 
                                                        type="text" 
                                                        value={item.text_ru} 
                                                        onChange={(e) => updateAnnouncementItem(i, 'text_ru', e.target.value)}
                                                        placeholder="Введите текст..."
                                                        className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 px-4 py-2 text-xs font-bold text-black dark:text-white outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">PL (Polski)</label>
                                                    <input 
                                                        type="text" 
                                                        value={item.text_pl} 
                                                        onChange={(e) => updateAnnouncementItem(i, 'text_pl', e.target.value)}
                                                        placeholder="Wpisz tekst..."
                                                        className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 px-4 py-2 text-xs font-bold text-black dark:text-white outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">EN (English)</label>
                                                    <input 
                                                        type="text" 
                                                        value={item.text_en} 
                                                        onChange={(e) => updateAnnouncementItem(i, 'text_en', e.target.value)}
                                                        placeholder="Enter text..."
                                                        className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 px-4 py-2 text-xs font-bold text-black dark:text-white outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Link (Optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={item.link} 
                                                    onChange={(e) => updateAnnouncementItem(i, 'link', e.target.value)}
                                                    placeholder="/shop or https://..."
                                                    className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 px-4 py-2 text-xs font-bold text-black dark:text-white outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {announcementItems.length === 0 && (
                                        <div className="py-12 text-center border-2 border-dashed border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-black/20 dark:text-white/20">
                                            No_Announcement_Items_Configured
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Search Animation Section */}
                <section className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-8 md:p-12 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Settings2 size={20} />
                                Search_Typewriter_Module
                            </h3>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-black/40">Define search placeholder animation keywords</p>
                        </div>
                        <button
                            onClick={addPlaceholder}
                            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            <Plus size={14} />
                            Add_Keyword
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {placeholders.map((p, i) => (
                            <div key={i} className="flex group">
                                <div className="w-10 flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.03] border border-r-0 border-black/10 dark:border-white/10 text-[9px] font-black font-mono">
                                    {(i + 1).toString().padStart(2, '0')}
                                </div>
                                <input
                                    type="text"
                                    value={p}
                                    onChange={(e) => updatePlaceholder(i, e.target.value)}
                                    placeholder="Enter keyword..."
                                    className="flex-1 bg-transparent border border-black/10 dark:border-white/10 px-4 py-3 text-xs font-bold tracking-widest outline-none focus:border-black dark:focus:border-white transition-all"
                                />
                                <button
                                    onClick={() => removePlaceholder(i)}
                                    className="w-10 flex items-center justify-center border border-l-0 border-black/10 dark:border-white/10 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full md:w-auto px-12 py-6 bg-black dark:bg-white text-white dark:text-black text-[12px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? "SYNCHRONIZING..." : "COMMIT_CHANGES"}
                    </button>
                </div>
            </div>
        </div>
    );
}
