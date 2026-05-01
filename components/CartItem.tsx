import Image from "next/image";

type CartItemProps = {
  title: string;
  price: number;
  quantity: number;
  image?: string;
  onQuantityChange: (quantity: number) => void;
  onRemove?: () => void;
};

const formatPrice = (price: number) => {
  const formattedPrice = Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formattedPrice} ₴`;
};

export function CartItem({
  title,
  price,
  quantity,
  image,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <li className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
        <Image
          src={image ?? "/window.svg"}
          alt={title}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-base font-medium leading-6">{title}</h2>
          <p className="text-sm text-zinc-600">{formatPrice(price)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 items-center rounded-xl border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={() => onQuantityChange(quantity - 1)}
              className="h-10 w-10 text-lg leading-none text-zinc-700 transition-colors hover:bg-zinc-100"
              aria-label={`Decrease ${title} quantity`}
            >
              -
            </button>
            <span className="min-w-10 px-3 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="h-10 w-10 text-lg leading-none text-zinc-700 transition-colors hover:bg-zinc-100"
              aria-label={`Increase ${title} quantity`}
            >
              +
            </button>
          </div>

          <p className="min-w-24 text-right text-sm font-semibold">
            {formatPrice(price * quantity)}
          </p>

          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
