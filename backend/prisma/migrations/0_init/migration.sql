-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Item" (
    "itemID" SERIAL NOT NULL,
    "ownerID" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemQuantity" INTEGER NOT NULL DEFAULT 1,
    "itemLink" TEXT,
    "itemImageURL" TEXT,
    "itemDescription" TEXT,
    "itemQuantityPurchased" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("itemID")
);

-- CreateTable
CREATE TABLE "List" (
    "ownerID" TEXT NOT NULL,
    "shareID" TEXT,
    "auth0Sub" TEXT,
    "listName" TEXT NOT NULL DEFAULT 'List',
    "onlyThisAccount" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "List_pkey" PRIMARY KEY ("ownerID")
);

-- CreateTable
CREATE TABLE "SharedList" (
    "id" SERIAL NOT NULL,
    "accountSharedTo" TEXT NOT NULL,
    "shareID" TEXT NOT NULL,

    CONSTRAINT "SharedList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "List_shareID_key" ON "List"("shareID");

-- CreateIndex
CREATE UNIQUE INDEX "SharedList_accountSharedTo_shareID_key" ON "SharedList"("accountSharedTo", "shareID");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_ownerID_fkey" FOREIGN KEY ("ownerID") REFERENCES "List"("ownerID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedList" ADD CONSTRAINT "SharedList_shareID_fkey" FOREIGN KEY ("shareID") REFERENCES "List"("shareID") ON DELETE RESTRICT ON UPDATE CASCADE;
