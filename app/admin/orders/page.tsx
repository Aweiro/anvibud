"use client";

import { useState, useEffect } from "react";
import { 
    ShoppingBag, 
    PhoneCall, 
    Clock, 
    CheckCircle2, 
    Trash2, 
    ChevronRight, 
    ExternalLink,
    Calendar,
    Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrders, updateOrderStatus, deleteOrder } from "@/lib/actions/order.actions";
import { getCallbackRequests, updateCallbackStatus, deleteCallbackRequest } from "@/lib/actions/callback.actions";
import { useToast } from "@/lib/stores/toast.store";

export default function AdminOrdersPage() {
    const [activeTab, setActiveTab] = useState<"orders" | "callbacks">("orders");
    const [orders, setOrders] = useState<any[]>([]);
    const [callbacks, setCallbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        const [ordersRes, callbacksRes] = await Promise.all([
            getOrders(),
            getCallbackRequests()
        ]);

        if (ordersRes.success && ordersRes.data) {
            setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        }
        if (callbacksRes.success && callbacksRes.data) {
            setCallbacks(Array.isArray(callbacksRes.data) ? callbacksRes.data : []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateCallbackStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "PENDING" ? "CALLED" : "PENDING";
        const res = await updateCallbackStatus(id, newStatus);
        if (res.success) {
            setCallbacks(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
            showToast("Статус оновлено", "success");
        }
    };

    const handleDeleteCallback = async (id: string) => {
        if (!confirm("Ви впевнені?")) return;
        const res = await deleteCallbackRequest(id);
        if (res.success) {
            setCallbacks(prev => prev.filter(c => c.id !== id));
            showToast("Заявку видалено", "success");
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!confirm("Ви впевнені?")) return;
        const res = await deleteOrder(id);
        if (res.success) {
            setOrders(prev => prev.filter(o => o.id !== id));
            showToast("Замовлення видалено", "success");
        }
    };

    const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
        const res = await updateOrderStatus(id, newStatus);
        if (res.success) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            showToast("Статус замовлення оновлено", "success");
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-4 md:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-black/40 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                        <ShoppingBag size={14} />
                        <span>Management_System</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
                        {activeTab === "orders" ? "Orders" : "Consultations"}
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-none border border-black/10 dark:border-white/10">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "orders" ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"}`}
                    >
                        Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("callbacks")}
                        className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "callbacks" ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg" : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"}`}
                    >
                        Calls ({callbacks.filter(c => c.status === "PENDING").length} NEW)
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white animate-spin rounded-full" />
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {activeTab === "orders" ? (
                        <motion.div
                            key="orders"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {orders.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-black/5 dark:border-white/5">
                                    <p className="text-xs font-black uppercase tracking-widest text-black/20 dark:text-white/20">No_Orders_Found</p>
                                </div>
                            ) : (
                                orders.map((order) => (
                                    <div key={order.id} className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-shadow group">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-black/40 dark:text-white/40 uppercase tracking-widest">#{order.id.slice(-6)}</span>
                                                    <h3 className="text-lg font-black uppercase tracking-tight">{order.customerName}</h3>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xl font-black">{parseFloat(order.total).toLocaleString()} ₴</span>
                                                    <button 
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-500/10"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} />
                                                    {order.customerPhone}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    {formatDate(order.createdAt)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} />
                                                    <select 
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-black dark:text-white"
                                                    >
                                                        <option value="PENDING" className="bg-white dark:bg-zinc-900">PENDING</option>
                                                        <option value="PAID" className="bg-white dark:bg-zinc-900">PAID</option>
                                                        <option value="SHIPPED" className="bg-white dark:bg-zinc-900">SHIPPED</option>
                                                        <option value="COMPLETED" className="bg-white dark:bg-zinc-900">COMPLETED</option>
                                                        <option value="CANCELLED" className="bg-white dark:bg-zinc-900">CANCELLED</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-black/5 dark:border-white/5">
                                                <div className="space-y-2">
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-black dark:text-white uppercase">{item.product.name}</span>
                                                                {item.size && <span className="text-[10px] bg-black/5 px-2 py-0.5">SIZE: {item.size}</span>}
                                                            </div>
                                                            <span className="text-black/40 dark:text-white/40">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="callbacks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {callbacks.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-black/5 dark:border-white/5">
                                    <p className="text-xs font-black uppercase tracking-widest text-black/20 dark:text-white/20">No_Callback_Requests</p>
                                </div>
                            ) : (
                                callbacks.map((cb) => (
                                    <div key={cb.id} className={`bg-white dark:bg-zinc-900 border transition-all p-6 flex flex-col md:flex-row items-center justify-between gap-6 group ${cb.status === 'CALLED' ? 'border-black/5 dark:border-white/5 opacity-60' : 'border-black/20 dark:border-white/20 shadow-lg'}`}>
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className={`w-12 h-12 flex items-center justify-center rounded-none ${cb.status === 'CALLED' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                                                {cb.status === 'CALLED' ? <CheckCircle2 size={24} /> : <PhoneCall size={24} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black tracking-tight">{cb.phone}</h3>
                                                    {cb.status === 'PENDING' && (
                                                        <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest animate-pulse">New_Request</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-[0.2em]">
                                                    Requested: {formatDate(cb.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => handleUpdateCallbackStatus(cb.id, cb.status)}
                                                className={`flex-1 md:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${cb.status === 'CALLED' ? 'border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white' : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:scale-105'}`}
                                            >
                                                {cb.status === 'CALLED' ? "Mark_as_New" : "Mark_as_Called"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCallback(cb.id)}
                                                className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
