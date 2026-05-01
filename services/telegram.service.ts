import type { CheckoutInput } from "@/lib/validations/checkout";

const formatPrice = (price: number) =>
  `${price.toFixed(2)} ₴`;

export function formatOrderMessage(data: CheckoutInput) {
  const items = data.items
    .map(
      (item, index) =>
        `${index + 1}. Item ID: ${item.productId}${item.size ? ` (Size: ${item.size})` : ''}\nQty: ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`,
    )
    .join("\n\n");

  return `📦 NEW_ORDER_RECEIVED\n\n👤 CUSTOMER: ${data.name}\n📞 PHONE: ${data.phone}\n\n🛒 ITEMS:\n${items}\n\n------------------\n💰 SUBTOTAL: ${formatPrice(data.subtotal)}\n🚚 SHIPPING: ${data.shippingCost > 0 ? formatPrice(data.shippingCost) : "FREE"}\n💎 TOTAL: ${formatPrice(data.total)}`;
}

export async function sendOrderToTelegram(data: CheckoutInput) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Telegram configuration is missing");
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatOrderMessage(data),
    }),
  });

  if (!response.ok) {
    throw new Error("Telegram message could not be sent");
  }
}
