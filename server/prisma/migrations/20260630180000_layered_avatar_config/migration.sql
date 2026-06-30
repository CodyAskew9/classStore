-- RedefineTables: replace avatarId with avatarConfig (SQLite JSON as TEXT)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionEndsAt" DATETIME,
    "classId" TEXT,
    "avatarConfig" TEXT NOT NULL DEFAULT '{"colorMode":true,"body":"body_01.png","pupils":"pupils_01.png","eyebrows":"eyebrows_01.png","eyelashes":"eyelashes_01.png","mouth":null,"beard":null,"hairBack":null,"hair":null,"bangs":null,"hairBonus":null,"top":null,"bottom":null,"dress":null,"gloves":null,"shoes":null}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("id", "email", "passwordHash", "name", "role", "subscriptionTier", "subscriptionEndsAt", "classId", "avatarConfig", "createdAt")
SELECT "id", "email", "passwordHash", "name", "role", "subscriptionTier", "subscriptionEndsAt", "classId", '{"colorMode":true,"body":"body_01.png","pupils":"pupils_01.png","eyebrows":"eyebrows_01.png","eyelashes":"eyelashes_01.png","mouth":null,"beard":null,"hairBack":null,"hair":null,"bangs":null,"hairBonus":null,"top":null,"bottom":null,"dress":null,"gloves":null,"shoes":null}', "createdAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_classId_idx" ON "User"("classId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
