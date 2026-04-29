import { createOrder } from "@/services/order.service";
import { sendOrderToTelegram } from "@/services/telegram.service";
import { checkoutSchema } from "@/lib/validations/checkout";

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const result = checkoutSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const order = await createOrder(result.data);
    
    // Attempt to send to Telegram, but don't fail the whole request if it fails
    try {
      await sendOrderToTelegram(result.data);
    } catch (tgError) {
      console.error("TELEGRAM_NOTIFICATION_ERROR:", tgError);
    }

    // Serialize order to handle Decimal types
    const serializedOrder = JSON.parse(JSON.stringify(order, (key, value) =>
      typeof value === 'object' && value !== null && value.constructor.name === 'Decimal'
        ? value.toString()
        : value
    ));

    return Response.json({ order: serializedOrder }, { status: 201 });
  } catch (error: any) {
    console.error("ORDER_SUBMISSION_ERROR:", error);
    return Response.json(
      {
        error: "Order could not be submitted",
        details: error.message
      },
      { status: 500 },
    );
  }
}
