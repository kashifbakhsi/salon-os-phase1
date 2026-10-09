import { Module } from "@nestjs/common";

import { SalonAdminController } from "./salon-admin.controller";
import { SalonAdminService } from "./salon-admin.service";

@Module({
controllers: [SalonAdminController],
providers: [SalonAdminService],
})
export class SalonAdminModule {}
