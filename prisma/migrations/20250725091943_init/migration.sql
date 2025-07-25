-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'TV');

-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('PLANNED', 'WATCHING', 'COMPLETED', 'PAUSED', 'DROPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "showSpoilers" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watched_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "title" TEXT NOT NULL,
    "poster" TEXT,
    "releaseDate" TIMESTAMP(3),
    "status" "WatchStatus" NOT NULL DEFAULT 'PLANNED',
    "rating" SMALLINT,
    "startDate" TIMESTAMP(3),
    "finishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentSeason" SMALLINT,
    "currentEpisode" SMALLINT,
    "totalSeasons" SMALLINT,
    "totalEpisodes" SMALLINT,
    "currentRuntime" INTEGER,
    "totalRuntime" INTEGER,

    CONSTRAINT "watched_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "watchedItemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "hasSpoilers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "watched_items_userId_tmdbId_mediaType_key" ON "watched_items"("userId", "tmdbId", "mediaType");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watched_items" ADD CONSTRAINT "watched_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_watchedItemId_fkey" FOREIGN KEY ("watchedItemId") REFERENCES "watched_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
