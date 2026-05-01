"use client";

import { useState, useRef, useEffect } from "react";
import { submitProduct, editProductAction } from "./create/actions";
import { getCloudinarySignature } from "./cloudinary-actions";
import { useRouter } from "next/navigation";
import { aiTranslateAction, aiGenerateDescriptionAction } from "../actions/ai_actions";
import { useToast } from "@/lib/stores/toast.store";

interface Category {
    id: string;
    name: string;
    subcategories: { id: string; name: string }[];
}

interface ProductFormProps {
    categories: Category[];
    brands?: string[];
    product?: any; // Optional for edit mode
}

export default function ProductForm({
    categories,
    brands = [],
    product,
}: ProductFormProps) {
    const isEdit = !!product;
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Lang State
    const [activeTab, setActiveTab] = useState<string>("en");
    const [names, setNames] = useState<Record<string, string>>({
        en: product?.name || "",
        uk: product?.name_uk || "",
        pl: product?.name_pl || "",
    });
    const [descriptions, setDescriptions] = useState<Record<string, string>>({
        en: product?.description || "",
        uk: product?.description_uk || "",
        pl: product?.description_pl || "",
    });
    const [isTranslating, setIsTranslating] = useState(false);

    // Image State
    const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Dropdown States
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.subcategory?.categoryId || "");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(product?.subcategoryId || "");
    const [selectedLabel, setSelectedLabel] = useState<string>(product?.label || "");
    const [brandQuery, setBrandQuery] = useState(product?.brand || "");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Size Variants State
    const [sizeVariants, setSizeVariants] = useState<{ size: string, price: string, salePrice?: string, stock?: string }[]>(
        product?.sizeVariants && Array.isArray(product.sizeVariants)
            ? product.sizeVariants
            : []
    );

    const handleAddSizeVariant = () => {
        setSizeVariants([...sizeVariants, { size: "", price: "", salePrice: "", stock: "" }]);
    };

    const handleRemoveSizeVariant = (index: number) => {
        setSizeVariants(sizeVariants.filter((_, i) => i !== index));
    };

    const handleSizeVariantChange = (index: number, field: "size" | "price" | "salePrice" | "stock", value: string) => {
        const newVariants = [...sizeVariants];
        (newVariants[index] as any)[field] = value;
        setSizeVariants(newVariants);
    };

    // Specifications State
    const [specifications, setSpecifications] = useState<{ key: string, value: string }[]>(
        product?.specifications && Array.isArray(product.specifications) 
            ? product.specifications 
            : []
    );

    const handleAddSpecification = () => {
        setSpecifications([...specifications, { key: "", value: "" }]);
    };

    const handleRemoveSpecification = (index: number) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    const handleSpecificationChange = (index: number, field: "key" | "value", value: string) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setNewImages((prev) => [...prev, ...newFiles]);
            const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
            setPreviews((prev) => [...prev, ...newPreviews]);
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
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            if (newFiles.length > 0) {
                setNewImages((prev) => [...prev, ...newFiles]);
                const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
                setPreviews((prev) => [...prev, ...newPreviews]);
                
                // Sync with input
                const fileInput = document.querySelector('input[name="images"]') as HTMLInputElement;
                if (fileInput) {
                    const dataTransfer = new DataTransfer();
                    // Add existing files from state + new ones
                    // Note: newImages state might not be updated yet, so we use functional update or manual sync
                    // Since the form uses FormData(e.currentTarget) and we manually append newImages in handleSubmit,
                    // we actually don't NEED to sync the input if we handle it in handleSubmit.
                    // Let's check handleSubmit.
                }
            }
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const currentCategory = categories.find((c) => c.id === selectedCategoryId);
    const subcategories = currentCategory?.subcategories || [];

    const labelOptions = [
        { value: "", label: "__NONE__" },
        { value: "BESTSELLER", label: "BESTSELLER" },
        { value: "NEW", label: "NEW_COLLECTION" },
        { value: "SALE", label: "SALE_REDUCTION" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown-container]')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNameChange = (lang: string, value: string) => {
        setNames(prev => ({ ...prev, [lang]: value }));
        if (lang === "en" && !isEdit) {
            const slugInput = document.getElementById("slug-input") as HTMLInputElement;
            if (slugInput && !slugInput.value.trim() && value) {
                slugInput.value = value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
            }
        }
    };

    const handleDescriptionChange = (lang: string, value: string) => {
        setDescriptions(prev => ({ ...prev, [lang]: value }));
    };

    const handleAiTranslate = async () => {
        if (!names.en) {
            showToast("INPUT_PRIMARY_SOURCE_FIRST", "warning");
            return;
        }
        setIsTranslating(true);
        try {
            const [nameResult, descResult] = await Promise.all([
                aiTranslateAction(names.en),
                aiGenerateDescriptionAction(names.en)
            ]);

            if (nameResult.success && nameResult.data) setNames(nameResult.data);
            if (descResult.success && descResult.data) setDescriptions(descResult.data);

            if (!nameResult.success || !descResult.success) {
                showToast("AI_SYNC_COMPLETED_WITH_ERRORS", "warning");
            } else {
                showToast("AI_SYNC_FULL_SUCCESS", "success");
            }
        } catch (error) {
            console.error("AI Sync Error:", error);
            showToast("AI_SERVICE_ERROR_RETRY", "error");
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

        formData.set("description", descriptions.en);
        formData.set("description_uk", descriptions.uk);
        formData.set("description_pl", descriptions.pl);

        formData.set("subcategoryId", selectedSubcategoryId);
        formData.set("label", selectedLabel);
        formData.set("brand", brandQuery);
        formData.set("specifications", JSON.stringify(specifications.filter(s => s.key && s.value && String(s.key).trim() !== "" && String(s.value).trim() !== "")));
        formData.set("sizeVariants", JSON.stringify(sizeVariants.filter(v => v.size.trim() !== "" && v.price !== null && v.price !== undefined && String(v.price).trim() !== "")));

        // Remove the original images from formData to avoid sending them to the server
        formData.delete("images");

        try {
            // Upload images on the client side
            const uploadedUrls = [];
            if (newImages.length > 0) {
                showToast("UPLOADING_ASSETS_TO_CLOUD...", "warning");
                for (const img of newImages) {
                    const url = await uploadToCloudinary(img);
                    uploadedUrls.push(url);
                }
            }

            // Append pre-uploaded URLs to formData
            uploadedUrls.forEach(url => formData.append("imageUrls", url));

            const result = isEdit
                ? await editProductAction(product.id, formData, existingImages)
                : await submitProduct(formData);

            if (result.success) {
                showToast(isEdit ? "MODIFICATION_COMMITTED_SUCCESSFULLY" : "ENTRY_COMMITTED_SUCCESSFULLY", "success");
                if (!isEdit) {
                    formRef.current?.reset();
                    setNames({ en: "", uk: "", pl: "" });
                    setDescriptions({ en: "", uk: "", pl: "" });
                    setNewImages([]);
                    setPreviews([]);
                    setSelectedCategoryId("");
                    setSelectedSubcategoryId("");
                    setSelectedLabel("");
                    setBrandQuery("");
                    setSizeVariants([]);
                    setSpecifications([]);
                } else {
                    router.push("/admin/products");
                    router.refresh();
                }
            } else {
                showToast("ERROR_CODE: " + result.error, "error");
            }
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "UNEXPECTED_SYSTEM_FAILURE", "error");
        } finally {
            setLoading(false);
        }
    };

    const languages = [
        { id: "en", label: "EN" },
        { id: "uk", label: "UA" },
        { id: "pl", label: "PL" },
    ];

    // Pre-calculate Sale Price for Edit mode
    const initialPrice = product ? Number(product.price) : 0;
    const initialDiscountVal = product ? Number(product.discountAmount || 0) : 0;
    const initialSalePrice = initialPrice - initialDiscountVal;

    return (
        <div className="py-12 px-6">
            <form ref={formRef} onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                <div className="mb-8 md:mb-16 space-y-3 md:space-y-4 text-left">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-1 md:w-1.5 h-6 bg-black dark:bg-white" />
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black dark:text-white">
                            {isEdit ? "Modify_Entity" : "New_Product_Entry"}
                        </h1>
                    </div>
                    {isEdit && (
                        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-black/40 dark:text-white/40">
                            Product ID: {product.id.toUpperCase()} // Status: ONLINE
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-12">
                        {/* Identification */}
                        <div className="space-y-6">
                            <div className="flex items-end justify-between">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30">01 // Primary Identification</span>
                                <button
                                    type="button"
                                    onClick={handleAiTranslate}
                                    disabled={isTranslating || !names.en}
                                    className="flex items-center gap-2 group disabled:opacity-30"
                                >
                                    <div className="w-2 h-2 bg-black dark:bg-white animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] border-b border-black/20 group-hover:border-black transition-all">
                                        {isTranslating ? "Processing_Translations..." : "Magic_AI_Sync"}
                                    </span>
                                </button>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex gap-2 border-b border-black/[0.03] dark:border-white/[0.03] pb-1">
                                {languages.map(lang => (
                                    <button
                                        key={lang.id}
                                        type="button"
                                        onClick={() => setActiveTab(lang.id)}
                                        className={`px-4 py-2 text-[9px] font-black tracking-widest transition-all ${activeTab === lang.id ? "text-black dark:text-white border-b-2 border-black dark:border-white" : "text-black/20 dark:text-white/20 hover:text-black/40"}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4 pt-2">
                                {languages.map(lang => (
                                    <div key={lang.id} className={activeTab === lang.id ? "block space-y-4 animate-in fade-in duration-500" : "hidden"}>
                                        <div>
                                            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Product Name ({lang.label})</label>
                                            <input
                                                type="text"
                                                value={names[lang.id]}
                                                onChange={(e) => handleNameChange(lang.id, e.target.value)}
                                                required={lang.id === "en"}
                                                className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-bold tracking-widest outline-none focus:border-black dark:focus:border-white transition-all"
                                                placeholder={lang.id === "en" ? "ARCHIVAL_PIECE_v1" : `TRANS_LOCAL_${lang.label}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Documentation ({lang.label})</label>
                                            <textarea
                                                value={descriptions[lang.id]}
                                                onChange={(e) => handleDescriptionChange(lang.id, e.target.value)}
                                                rows={4}
                                                className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-bold tracking-widest outline-none focus:border-black dark:focus:border-white transition-all resize-none"
                                                placeholder={`Input localized description for ${lang.label}...`}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Slug_Identifier</label>
                                    <input
                                        id="slug-input"
                                        type="text"
                                        name="slug"
                                        defaultValue={product?.slug || ""}
                                        required
                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-mono font-bold tracking-tighter outline-none focus:border-black dark:focus:border-white transition-all"
                                        placeholder="automata-generated-id"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mapping */}
                        <div className="space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30">02 // Structural Mapping</span>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="relative" data-dropdown-container>
                                    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Category</label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-[10px] text-black dark:text-white font-black uppercase tracking-widest outline-none flex justify-between items-center"
                                    >
                                        <span>{categories.find(c => c.id === selectedCategoryId)?.name.toUpperCase() || "__SELECT__"}</span>
                                        <svg className={`w-3 h-3 transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openDropdown === "category" && (
                                        <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-black border border-black dark:border-white shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                                            {categories.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategoryId(c.id);
                                                        setSelectedSubcategoryId("");
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black/5"
                                                >
                                                    {c.name.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative" data-dropdown-container>
                                    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Subcategory</label>
                                    <button
                                        type="button"
                                        disabled={!selectedCategoryId || subcategories.length === 0}
                                        onClick={() => setOpenDropdown(openDropdown === "subcategory" ? null : "subcategory")}
                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-[10px] text-black dark:text-white font-black uppercase tracking-widest outline-none flex justify-between items-center disabled:opacity-20"
                                    >
                                        <span>{subcategories.find(s => s.id === selectedSubcategoryId)?.name.toUpperCase() || "__SELECT__"}</span>
                                        <svg className={`w-3 h-3 transition-transform ${openDropdown === "subcategory" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openDropdown === "subcategory" && (
                                        <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-black border border-black dark:border-white shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                                            {subcategories.map((sc) => (
                                                <button
                                                    key={sc.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedSubcategoryId(sc.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black/5"
                                                >
                                                    {sc.name.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30">03 // System Attribution</span>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="relative" data-dropdown-container>
                                    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Brand</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        value={brandQuery}
                                        onChange={(e) => {
                                            setBrandQuery(e.target.value);
                                            setOpenDropdown("brand");
                                        }}
                                        onFocus={() => setOpenDropdown("brand")}
                                        placeholder="MIGRA_CORE / ARCHIVE"
                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-[10px] text-black dark:text-white font-black tracking-widest outline-none"
                                    />
                                    {openDropdown === "brand" && (
                                        <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-black border border-black dark:border-white shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                                            {brandQuery && !brands.some(b => b.toLowerCase() === brandQuery.toLowerCase()) && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setBrandQuery(brandQuery); setOpenDropdown(null); }}
                                                    className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black/5"
                                                >
                                                    [+] Add_New: {brandQuery.toUpperCase()}
                                                </button>
                                            )}
                                            {brands.filter(b => b.trim() !== "" && b.toLowerCase().includes(brandQuery.toLowerCase())).map((b) => (
                                                <button
                                                    key={b}
                                                    type="button"
                                                    onClick={() => { setBrandQuery(b); setOpenDropdown(null); }}
                                                    className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black/5"
                                                >
                                                    {b.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative" data-dropdown-container>
                                    <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Special Label</label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenDropdown(openDropdown === "label" ? null : "label")}
                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-[10px] text-black dark:text-white font-black uppercase tracking-widest outline-none flex justify-between items-center"
                                    >
                                        <span>{labelOptions.find(l => l.value === selectedLabel)?.label || "__NONE__"}</span>
                                        <svg className={`w-3 h-3 transition-transform ${openDropdown === "label" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openDropdown === "label" && (
                                        <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-black border border-black dark:border-white shadow-2xl max-h-48 overflow-y-auto no-scrollbar">
                                            {labelOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedLabel(opt.value);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black/5"
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-4 border-y border-black/5 dark:border-white/5">
                                <input
                                    type="checkbox"
                                    name="isCustomOrder"
                                    id="isCustomOrder"
                                    defaultChecked={product?.isCustomOrder || false}
                                    className="w-4 h-4 rounded-none border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-black accent-black"
                                />
                                <label htmlFor="isCustomOrder" className="text-[10px] uppercase font-black tracking-widest text-black/60 dark:text-white/60 cursor-pointer">
                                    Enable_Custom_Order_Protocol (Pre-order)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {/* Metrics */}
                        <div className="space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30">04 // Economic Metrics</span>
                            <div className="space-y-4">
                                <label className="block text-[10px] uppercase font-black tracking-widest text-black dark:text-white">Pricing Structure</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]">
                                    <div>
                                        <label className="block text-[8px] uppercase font-bold mb-2 text-black/40 dark:text-white/40">Base Size / Weight</label>
                                        <input
                                            type="text"
                                            name="baseSize"
                                            defaultValue={(product as any)?.baseSize || ""}
                                            placeholder="e.g. 50mm"
                                            className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] uppercase font-bold mb-2 text-black/40 dark:text-white/40">Base Price (Original $)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            step="0.01"
                                            defaultValue={product?.price || ""}
                                            required
                                            placeholder="0.00"
                                            className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] uppercase font-bold mb-2 text-black/40 dark:text-white/40">Sale Price (Current $)</label>
                                        <input
                                            type="number"
                                            name="salePrice"
                                            step="0.01"
                                            defaultValue={isEdit && initialSalePrice < initialPrice ? initialSalePrice : ""}
                                            placeholder="Optional"
                                            className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-black dark:text-white">Inventory Management</label>
                                <input
                                    type="number"
                                    name="stock"
                                    defaultValue={product?.stock || ""}
                                    placeholder="0"
                                    className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-4 py-4 rounded-none text-xs text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Dimensions & Pricing Variants */}
                        <div className="space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30">05 // Dimensional Pricing Matrix</span>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-black dark:text-white">Price per Size</label>
                                    <button
                                        type="button"
                                        onClick={handleAddSizeVariant}
                                        className="text-[9px] font-black uppercase tracking-[0.2em] border-b border-black/20 hover:border-black transition-all"
                                    >
                                        [+] Add Variant
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {sizeVariants.map((variant, index) => (
                                        <div key={index} className="flex flex-col gap-3 p-4 border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={variant.size}
                                                    onChange={(e) => handleSizeVariantChange(index, "size", e.target.value)}
                                                    placeholder="Розмір / Вага (напр. 100мм або 22кг/м3)"
                                                    className="flex-1 bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-3 py-3 rounded-none text-xs text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSizeVariant(index)}
                                                    className="w-10 h-10 flex items-center justify-center bg-red-500 text-white font-black hover:bg-red-600 transition-colors"
                                                >
                                                    X
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-black text-black/40 dark:text-white/40">Regular_Price</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={variant.price}
                                                        onChange={(e) => handleSizeVariantChange(index, "price", e.target.value)}
                                                        placeholder="₴"
                                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-3 py-2 rounded-none text-xs text-black dark:text-white font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-black text-black/40 dark:text-white/40">Sale_Price</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={variant.salePrice || ""}
                                                        onChange={(e) => handleSizeVariantChange(index, "salePrice", e.target.value)}
                                                        placeholder="₴"
                                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-3 py-2 rounded-none text-xs text-black dark:text-white font-bold outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] uppercase font-black text-black/40 dark:text-white/40">Stock_Qty</label>
                                                    <input
                                                        type="number"
                                                        value={variant.stock || ""}
                                                        onChange={(e) => handleSizeVariantChange(index, "stock", e.target.value)}
                                                        placeholder="QTY"
                                                        className="w-full bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-3 py-2 rounded-none text-xs text-black dark:text-white font-bold outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {sizeVariants.length === 0 && (
                                        <div className="text-center py-6 border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-[10px] uppercase tracking-widest text-black/40">
                                            No size variants defined. Default price will be used.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30">05.5 // Technical Specifications</span>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-black dark:text-white">Key-Value Pairs</label>
                                    <button
                                        type="button"
                                        onClick={handleAddSpecification}
                                        className="text-[9px] font-black uppercase tracking-[0.2em] border-b border-black/20 hover:border-black transition-all"
                                    >
                                        [+] Add Attribute
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {specifications.map((spec, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={spec.key}
                                                onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                                                placeholder="Напруга акумулятора"
                                                className="flex-1 bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-3 py-3 rounded-none text-xs text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                            />
                                            <input
                                                type="text"
                                                value={spec.value}
                                                onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                                                placeholder="20V"
                                                className="flex-1 bg-white dark:bg-zinc-900 border border-black/20 dark:border-white/20 px-3 py-3 rounded-none text-xs text-black dark:text-white font-bold outline-none focus:border-black dark:focus:border-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSpecification(index)}
                                                className="w-10 h-10 flex items-center justify-center bg-red-500 text-white font-black hover:bg-red-600 transition-colors"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                    {specifications.length === 0 && (
                                        <div className="text-center py-6 border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-[10px] uppercase tracking-widest text-black/40">
                                            No technical specifications added.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Assets */}
                        <div className="space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30 dark:text-white/30">06 // Visual Assets Protocol</span>

                            {isEdit && existingImages.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-[8px] uppercase font-black tracking-widest text-black/40">Current_Assets_In_Database</label>
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                        {existingImages.map((src, index) => (
                                            <div key={index} className="aspect-square relative border border-black/10 p-1 group">
                                                <img src={src} className="w-full h-full object-cover grayscale brightness-90" alt="" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-black"
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed p-8 text-center relative group cursor-pointer transition-all ${isDragging ? "border-black bg-black/5 dark:border-white dark:bg-white/5" : "border-black/20 dark:border-white/20 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"}`}
                            >
                                <input
                                    type="file"
                                    name="images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-2">
                                    <div className="text-[10px] text-black dark:text-white font-black uppercase tracking-[0.4em]">
                                        {isDragging ? "Drop_Assets_Now" : isEdit ? "Asset_Sync_Protocol" : "Asset_Push_Protocol"}
                                    </div>
                                    <div className="text-[8px] uppercase tracking-widest text-black/30 dark:text-white/30">
                                        {isDragging ? "Ready for batch upload" : isEdit ? "Append New Content or Drag Files" : "Upload Multi_Media Content or Drag Files"}
                                    </div>
                                </div>
                            </div>

                            {previews.length > 0 && (
                                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                    {previews.map((src, index) => (
                                        <div key={index} className={`aspect-square relative border border-black/10 p-1 group ${isEdit ? 'border-dashed' : ''}`}>
                                            <img src={src} className="w-full h-full object-cover grayscale brightness-90" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-black"
                                            >
                                                {isEdit ? "CANCEL" : "X"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-8 flex flex-col md:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => router.push("/admin/products")}
                                className="w-full md:flex-1 py-4 md:py-6 bg-transparent text-black dark:text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                            >
                                __CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:flex-[2] py-4 md:py-6 bg-black dark:bg-white text-white dark:text-black text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] border border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:bg-transparent dark:hover:text-white transition-all disabled:opacity-20"
                            >
                                {loading ? (isEdit ? "PROCESSING_SYNC..." : "INITIALIZING_UPLOAD...") : "SAVE_CHANGES"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
