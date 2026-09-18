"use client";

import { motion } from "motion/react";
import type { ShopItem, ShopPurchase } from "@/src/types";

type Props = {
  coins: number;
  items: readonly ShopItem[];
  purchases: ShopPurchase[];
  arrived: boolean;
  cluePurchased: boolean;
  taskCompleted: boolean;
  onClose(): void;
  onBuy(item: ShopItem): void;
  onRedeem(purchaseId: string): void;
};

export function ShopPanel({
  coins,
  items,
  purchases,
  arrived,
  cluePurchased,
  taskCompleted,
  onClose,
  onBuy,
  onRedeem,
}: Props) {
  const vouchers = purchases.filter((purchase) =>
    purchase.kind === "milk-tea" || purchase.kind === "food",
  );

  return (
    <motion.div className="shop-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.section className="shop-panel" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <header>
          <div><span>ATLAS SUPPLY SHOP</span><h2>探索补给商店</h2></div>
          <strong aria-label={`金币余额 ${coins}`}>✦ {coins}</strong>
          <button type="button" onClick={onClose}>关闭</button>
        </header>

        <div className="shop-grid">
          {items.map((item) => {
            const disabled =
              coins < item.price ||
              (item.kind === "clue" && (cluePurchased || taskCompleted)) ||
              (item.kind === "skip-task" && (!arrived || taskCompleted));
            const state = item.kind === "clue" && cluePurchased
              ? "已购买"
              : item.kind === "skip-task" && !arrived
                ? "GPS 到达后可用"
                : taskCompleted && (item.kind === "clue" || item.kind === "skip-task")
                  ? "本站已完成"
                  : coins < item.price
                    ? "金币不足"
                    : `购买 · ${item.price} 金币`;
            return (
              <article key={item.id}>
                <span>{item.kind === "clue" ? "线索" : item.kind === "skip-task" ? "通行" : "兑换券"}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <button type="button" disabled={disabled} onClick={() => onBuy(item)}>{state}</button>
              </article>
            );
          })}
        </div>

        {vouchers.length > 0 && (
          <section className="voucher-list" aria-label="本机兑换券">
            <h3>本机兑换券</h3>
            {vouchers.map((voucher) => (
              <article key={voucher.id} className={voucher.consumedAt ? "is-redeemed" : ""}>
                <div><span>LOCAL VOUCHER</span><b>{voucher.kind === "milk-tea" ? "奶茶兑换券" : "食品兑换券"}</b></div>
                <button type="button" disabled={Boolean(voucher.consumedAt)} onClick={() => onRedeem(voucher.id)}>
                  {voucher.consumedAt ? "已兑换" : "确认已兑换"}
                </button>
              </article>
            ))}
          </section>
        )}
      </motion.section>
    </motion.div>
  );
}
