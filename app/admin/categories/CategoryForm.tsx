"use client";

import { useState, useRef, useEffect } from "react";
import { createCategory, createSubcategory, updateCategory, updateSubcategory } from "./create/actions";
import { getCloudinarySignature } from "../products/cloudinary-actions";
import { aiTranslateAction } from "../actions/ai_actions";
import { useToast } from "@/lib/stores/toast.store";
import { useRouter } from "next/navigation";

interface Category {
    id: string;
    name: string;
}

interface CategoryFormProps {
    categories: Category[];
    item?: any; // Optional for edit mode
    initialType?: "category" | "subcategory";
}

export default function CategoryForm({
    categories,
    item,
    initialType = "category"
}: CategoryFormProps) {
    const isEdit = !!item;
    const itemType = isEdit ? (item.categoryId ? "subcategory" : "category") : initialType;

    const { showToast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"category" | "subcategory">(itemType as any);
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const [activeLangTab, setActiveLangTab] = useState<string>("en");
    const [names, setNames] = useState<Record<string, string>>({
        en: item?.name || "",
        uk: item?.name_uk || "",
        pl: item?.name_pl || "",
    });
    const [isTranslating, setIsTranslating] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [selectedCategoryId, setSelectedCategoryId] = useState(item?.categoryId || "");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (preview) URL.revokeObjectURL(preview);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (preview) URL.revokeObjectURL(preview);
            setPreview(URL.createObjectURL(file));
            
            // We also need to manually trigger the file input if we want the form to pick it up on submit
            // since the hidden input won't have it. But we can also handle it via state.
            // However, this form uses FormData from e.currentTarget.
            // So we should either use a state for the file or manually set the file to the input.
            const fileInput = document.querySelector('input[name="image"]') as HTMLInputElement;
            if (fileInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            }
        }
    };

    const handleNameChange = (lang: string, value: string) => {
        setNames(prev => ({ ...prev, [lang]: value }));
        if (lang === "en" && !isEdit) {
            const slugInput = document.getElementById("slug-input") as HTMLInputElement;
            if (slugInput && !slugInput.value.trim() && value) {
                slugInput.value = value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
            }
        }
    };

    const handleAiTranslate = async () => {
        if (!names.en) {
            showToast("INPUT_PRIMARY_SOURCE_FIRST", "warning");
            return;
        }
        setIsTranslating(true);
        try {
            const result = await aiTranslateAction(names.en);
            if (result.success && result.data) {
                setNames(result.data);
                showToast("AI_SYNC_SUCCESS", "success");
            } else {
                showToast("AI_SYNC_FAILED: " + result.error, "error");
            }
        } catch (error) {
            console.error(error);
            showToast("AI_SERVICE_UNAVAILABLE", "error");
        } finally {
            setIsTranslating(false);
        }
    };

    const uploadToCloudinary = async (file: File) => {
        try {
            const { timestamp, signature, cloudName, apiKey, folder } = await getCloudinarySignature();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey!);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.secure_url;
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.set("name", names.en);
        formData.set("name_uk", names.uk);
        formData.set("name_pl", names.pl);

        if (activeTab === "subcategory") {
            formData.set("categoryId", selectedCategoryId);
        }

        // Get the file from the input
        const fileInput = form.querySelector('input[name="image"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        // Remove the original file from formData to avoid sending it to the server
        formData.delete("image");

        try {
            // Upload image on the client side
            if (file) {
                showToast("UPLOADING_ASSET_TO_CLOUD...", "warning");
                const imageUrl = await uploadToCloudinary(file);
                formData.set("imageUrl", imageUrl);
            }

            let result;
            if (isEdit) {
                if (activeTab === "category") {
                    result = await updateCategory(item.id, formData);
                } else {
                    result = await updateSubcategory(item.id, formData);
                }
            } else {
                if (activeTab === "category") {
                    result = await createCategory(formData);
                } else {
                    result = await createSubcategory(formData);
                }
            }

            if (result.success) {
                showToast(isEdit ? "MODIFICATION_COMMITTED_SUCCESSFULLY" : `${activeTab.toUpperCase()}_INITIALIZED`, "success");
                if (isEdit) {
                    router.push("/admin/categories");
                    router.refresh();
                } else {
                    formRef.current?.reset();
                    window.location.reload();
                }
            } else {
                showToast("ERROR_CODE: " + result.error, "error");
            }
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "SYSTEM_CRITICAL_FAILURE", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 md:mb-12 space-y-3 md:space-y-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-1 md:w-1.5 h-6 bg-black dark:bg-white" />
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black dark:text-white leading-none">
                            {isEdit ? "Modify_Entity" : "Define_Node"}
                        </h2>
                    </div>
                    <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-black/40 dark:text-white/40">
                        {isEdit ? `ID: ${item.id.toUpperCase()}` : "System Catalog // Metadata Protocol // v4.2"}
                    </p>
                </div>

                {!isEdit && (
                    <div className="flex mb-8 md:mb-12 border border-black dark:border-white">
                        <button
                            type="button"
                            className={`flex-1 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "category"
                                ? "bg-black dark:bg-white text-white dark:text-black"
                                : "bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                            onClick={() => setActiveTab("category")}
                        >
                            [01] Root
                        </button>
                        <div className="w-px bg-black dark:bg-white" />
                        <button
                            type="button"
                            className={`flex-1 py-3 md:py-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "subcategory"
                                ? "bg-black dark:bg-white text-white dark:text-black"
                                : "bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                            onClick={() => setActiveTab("subcategory")}
                        >
                            [02] Sub
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2 border-b border-black/[0.03] dark:border-white/[0.03] pb-1">
                        {[
                            { id: "en", label: "EN" },
                            { id: "uk", label: "UA" },
                            { id: "pl", label: "PL" },
                        ].map(lang => (
                            <button
                                key={lang.id}
                                type="button"
                                onClick={() => setActiveLangTab(lang.id)}
                                className={`px-4 py-2 text-[9px] font-black tracking-widest transition-all ${activeLangTab === lang.id ? "text-black dark:text-white border-b-2 border-black dark:border-white" : "text-black/20 dark:text-white/20 hover:text-black/40"}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleAiTranslate}
                        disabled={isTranslating || !names.en}
                        className="flex items-center gap-2 group disabled:opacity-30"
                    >
                        <div className="w-1.5 h-1.5 bg-black dark:bg-white animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] border-b border-black/20 group-hover:border-black transition-all">
                            {isTranslating ? "Syncing..." : "Magic_Sync"}
                        </span>
                    </button>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">
                                {activeTab === "category" ? "Root_Name" : "Sub_Node_Name"} ({activeLangTab.toUpperCase()})
                            </label>
                            {[
                                { id: "en", label: "EN" },
                                { id: "uk", label: "UA" },
                                { id: "pl", label: "PL" },
                            ].map(lang => (
                                <input
                                    key={lang.id}
                                    type="text"
                                    value={names[lang.id]}
                                    onChange={(e) => handleNameChange(lang.id, e.target.value)}
                                    required={lang.id === "en"}
                                    className={`w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-bold tracking-widest outline-none focus:border-black dark:focus:border-white transition-all ${activeLangTab === lang.id ? "block" : "hidden"}`}
                                    placeholder={activeTab === "category" ? "PRIMARY_GROUP" : "CHILD_ELEMENT"}
                                />
                            ))}
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">
                                Slug_Identifier
                            </label>
                            <input
                                id="slug-input"
                                type="text"
                                name="slug"
                                defaultValue={item?.slug || ""}
                                required
                                className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-mono font-bold tracking-tighter outline-none focus:border-black dark:focus:border-white transition-all"
                                placeholder="url-safe-id"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">
                                {activeTab === "category" ? "Node_Graphic_Asset" : "Sub_Node_Graphic_Asset"}
                            </label>
                            {(preview || item?.image) && (
                                <div className="mb-6 p-4 border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-center gap-6">
                                    <img src={preview || item.image} alt="Preview" className="w-24 h-24 object-cover grayscale brightness-90 border border-black/20 dark:border-white/20" />
                                    <div className="space-y-1 overflow-hidden">
                                        <span className="text-[8px] uppercase font-black text-black/40 dark:text-white/40">
                                            {preview ? "New_Asset_Staged" : "Current_Asset_Active"}
                                        </span>
                                        <p className="text-[9px] font-mono text-black/60 dark:text-white/60 break-all truncate">
                                            {preview ? "Ready_for_Upload" : item.image.split('/').pop()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed p-8 text-center relative group cursor-pointer transition-all ${isDragging ? "border-black bg-black/5 dark:border-white dark:bg-white/5" : "border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"}`}
                            >
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-1">
                                    <div className="text-[9px] text-black dark:text-white font-black uppercase tracking-[0.3em]">
                                        {isDragging ? "Drop_Asset_Now" : (preview || item?.image) ? "Overwrite_Asset" : "Select_File_or_Drag_Here"}
                                    </div>
                                    <div className="text-[8px] uppercase tracking-widest text-black/30 dark:text-white/30 bg-transparent">JPG / PNG / WEBP</div>
                                </div>
                            </div>
                        </div>

                        {activeTab === "subcategory" && (
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">
                                    Parent_Node_Assignment
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-[10px] text-black dark:text-white font-black uppercase tracking-widest outline-none flex justify-between items-center"
                                >
                                    <span>{categories.find(c => c.id === selectedCategoryId)?.name.toUpperCase() || "__SELECT_PARENT__"}</span>
                                    <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-black border border-black dark:border-white shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                                        {categories.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategoryId(c.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black/5"
                                            >
                                                {c.name.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-8 flex flex-col md:flex-row gap-4">
                        {isEdit && (
                            <button
                                type="button"
                                onClick={() => router.push("/admin/categories")}
                                className="w-full md:flex-1 py-4 md:py-6 bg-transparent text-black dark:text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                            >
                                __CANCEL
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${isEdit ? "md:flex-[2]" : ""} py-4 md:py-6 bg-black dark:bg-white text-white dark:text-black text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] border border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:bg-transparent dark:hover:text-white transition-all disabled:opacity-20`}
                        >
                            {loading ? "PROCESSING..." : "SAVE_CHANGES"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
