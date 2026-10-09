import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { SalonsModule } from "./salons/salons.module";
import { ServicesModule } from "./services/services.module";
import { AvailabilityModule } from "./availability/availability.module";
import { AppointmentsModule } from "./appointments/appointments.module";
import { AuthModule } from "./auth/auth.module";
import { SalonAdminModule } from "./salon-admin/salon-admin.module";

@Module({
  imports: [PrismaModule,
    AuthModule,
    SalonsModule,
    ServicesModule,
    AvailabilityModule,
    AppointmentsModule,
    SalonAdminModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}