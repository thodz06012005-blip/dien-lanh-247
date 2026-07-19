-- Add the operational STAFF role declared by Prisma without removing legacy values.
ALTER TABLE `User`
  MODIFY `role` ENUM('CUSTOMER', 'STAFF', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'CUSTOMER';
