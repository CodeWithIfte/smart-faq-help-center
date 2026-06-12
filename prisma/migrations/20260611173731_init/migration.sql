-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "shop" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "searchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "widgetPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "widgetTheme" TEXT NOT NULL DEFAULT 'light',
    "displayCategories" BOOLEAN NOT NULL DEFAULT true,
    "faqOrder" TEXT NOT NULL DEFAULT 'position',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_shop_idx" ON "Category"("shop");

-- CreateIndex
CREATE INDEX "Category_shop_position_idx" ON "Category"("shop", "position");

-- CreateIndex
CREATE INDEX "Faq_shop_idx" ON "Faq"("shop");

-- CreateIndex
CREATE INDEX "Faq_shop_status_idx" ON "Faq"("shop", "status");

-- CreateIndex
CREATE INDEX "Faq_shop_position_idx" ON "Faq"("shop", "position");

-- CreateIndex
CREATE INDEX "Faq_shop_categoryId_idx" ON "Faq"("shop", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_shop_key" ON "Setting"("shop");

-- CreateIndex
CREATE INDEX "Setting_shop_idx" ON "Setting"("shop");

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
