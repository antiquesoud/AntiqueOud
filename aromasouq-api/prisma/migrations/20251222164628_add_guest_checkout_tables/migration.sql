/*
  Warnings:

  - Added the required column `size` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "variant_id" TEXT;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "sale_price" DOUBLE PRECISION,
ADD COLUMN     "size" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "guest_carts" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_agent" TEXT,
    "ip_address" TEXT,

    CONSTRAINT "guest_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_cart_items" (
    "id" TEXT NOT NULL,
    "guest_cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "session_token" TEXT,
    "guest_email" TEXT NOT NULL,
    "guest_phone" TEXT NOT NULL,
    "shipping_address" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipping_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "order_status" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_id" TEXT,
    "tracking_number" TEXT,
    "tracking_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "user_agent" TEXT,
    "ip_address" TEXT,

    CONSTRAINT "guest_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_order_items" (
    "id" TEXT NOT NULL,
    "guest_order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "product_name" TEXT NOT NULL,
    "product_name_ar" TEXT,
    "variant_name" TEXT,
    "variant_name_ar" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guest_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_carts_session_token_key" ON "guest_carts"("session_token");

-- CreateIndex
CREATE INDEX "guest_carts_session_token_idx" ON "guest_carts"("session_token");

-- CreateIndex
CREATE INDEX "guest_carts_created_at_idx" ON "guest_carts"("created_at");

-- CreateIndex
CREATE INDEX "guest_cart_items_guest_cart_id_idx" ON "guest_cart_items"("guest_cart_id");

-- CreateIndex
CREATE INDEX "guest_cart_items_product_id_idx" ON "guest_cart_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "guest_cart_items_guest_cart_id_product_id_variant_id_key" ON "guest_cart_items"("guest_cart_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "guest_orders_order_number_key" ON "guest_orders"("order_number");

-- CreateIndex
CREATE INDEX "guest_orders_order_number_idx" ON "guest_orders"("order_number");

-- CreateIndex
CREATE INDEX "guest_orders_guest_email_idx" ON "guest_orders"("guest_email");

-- CreateIndex
CREATE INDEX "guest_orders_session_token_idx" ON "guest_orders"("session_token");

-- CreateIndex
CREATE INDEX "guest_orders_order_status_idx" ON "guest_orders"("order_status");

-- CreateIndex
CREATE INDEX "guest_orders_created_at_idx" ON "guest_orders"("created_at" DESC);

-- CreateIndex
CREATE INDEX "guest_order_items_guest_order_id_idx" ON "guest_order_items"("guest_order_id");

-- CreateIndex
CREATE INDEX "guest_order_items_product_id_idx" ON "guest_order_items"("product_id");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_cart_items" ADD CONSTRAINT "guest_cart_items_guest_cart_id_fkey" FOREIGN KEY ("guest_cart_id") REFERENCES "guest_carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_cart_items" ADD CONSTRAINT "guest_cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_cart_items" ADD CONSTRAINT "guest_cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_order_items" ADD CONSTRAINT "guest_order_items_guest_order_id_fkey" FOREIGN KEY ("guest_order_id") REFERENCES "guest_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_order_items" ADD CONSTRAINT "guest_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_order_items" ADD CONSTRAINT "guest_order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
