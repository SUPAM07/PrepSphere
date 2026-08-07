import { BsStars } from "react-icons/bs";
import { FiCheck } from "react-icons/fi";

export default function PricingCard({
  title,
  price,
  coins,
  button,
  features,
  popular,
  disabled,
  onBuy,
}: any) {
  return (
    <div
      className={`relative w-full max-w-[320px] rounded-2xl overflow-hidden border p-5 transition-all
        ${popular
          ? "border-blue-500/40 bg-zinc-900 shadow-[0_8px_40px_rgba(37,99,235,0.2)]"
          : "border-zinc-800 bg-zinc-900 shadow-sm"
        }`}
    >
      {/* glass sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

      {/* Popular glow */}
      {popular && (
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      )}

      {popular && (
        <div className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white z-10">
          Popular
        </div>
      )}

      <h2 className="relative text-base font-bold text-white">{title}</h2>

      <div className="relative mt-2.5 flex items-end gap-1.5">
        <span className="text-3xl font-extrabold text-white">
          {price}
        </span>
        {price !== "Free" && (
          <span className="pb-1 text-xs text-white/40">
            INR
          </span>
        )}
      </div>

      <div className="relative mt-3.5 flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/8 p-2.5">
        <BsStars className="text-yellow-400" size={14} />
        <span className="text-sm font-semibold text-white">
          {coins} Interview Coins
        </span>
      </div>

      <div className="relative mt-3.5 space-y-1.5">
        {features.map((item: string) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs text-white/60"
          >
            <FiCheck className="text-green-400 shrink-0" size={13} />
            <span>{item}</span>
          </div>
        ))}
      </div>

     <button
  disabled={disabled}
  onClick={onBuy}
  className={`relative mt-5 w-full rounded-lg py-2 text-sm font-semibold transition
    ${
      disabled
        ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
        : popular
        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
        : "bg-transparent border border-white/15 text-white hover:border-white/30 hover:bg-white/10"
    }`}
>
  {button}
</button>
    </div>
  );
}