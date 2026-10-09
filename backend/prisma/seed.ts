import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import * as bcrypt from "bcrypt";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not defined. Please check backend/.env",
    );
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  console.log("🌱 Starting SalonOS database seed...");

  try {
    // ---------------------------------------------------------
    // 1. PASSWORDS
    // ---------------------------------------------------------

    const adminPasswordHash = await bcrypt.hash(
      "Admin@12345",
      10,
    );

    const staffPasswordHash = await bcrypt.hash(
      "Staff@12345",
      10,
    );

    // ---------------------------------------------------------
    // 2. SALON ADMIN
    // ---------------------------------------------------------

    const admin = await prisma.user.upsert({
      where: {
        email: "admin@demo-salon.com",
      },
      update: {
        name: "Demo Salon Admin",
        phone: "9000000001",
        passwordHash: adminPasswordHash,
        role: "SALON_ADMIN",
      },
      create: {
        name: "Demo Salon Admin",
        email: "admin@demo-salon.com",
        phone: "9000000001",
        passwordHash: adminPasswordHash,
        role: "SALON_ADMIN",
      },
    });

    console.log(`✅ Admin created: ${admin.email}`);

    const customerPasswordHash = await bcrypt.hash(
  "Customer@12345",
  10,
);

const customer = await prisma.user.upsert({
  where: {
    email: "customer@demo-salon.com",
  },
  update: {
    name: "Demo Customer",
    phone: "9000000099",
    passwordHash: customerPasswordHash,
    role: "CUSTOMER",
  },
  create: {
    name: "Demo Customer",
    email: "customer@demo-salon.com",
    phone: "9000000099",
    passwordHash: customerPasswordHash,
    role: "CUSTOMER",
  },
});

console.log(
  `✅ Customer ready: ${customer.email}`,
);

    // ---------------------------------------------------------
    // 3. DEMO SALON
    // ---------------------------------------------------------

    const existingSalon = await prisma.salon.findUnique({
      where: {
        slug: "demo-salon",
      },
    });

    const salon = existingSalon
      ? await prisma.salon.update({
          where: {
            id: existingSalon.id,
          },
          data: {
            name: "Demo Salon & Spa",
            description:
              "A modern demo salon for SalonOS development and testing.",
            phone: "9000000000",
            email: "hello@demo-salon.com",
            address: "123 MG Road",
            city: "Kolkata",
            state: "West Bengal",
            postalCode: "700001",
            status: "ACTIVE",
            ownerId: admin.id,
          },
        })
      : await prisma.salon.create({
          data: {
            name: "Demo Salon & Spa",
            slug: "demo-salon",
            description:
              "A modern demo salon for SalonOS development and testing.",
            phone: "9000000000",
            email: "hello@demo-salon.com",
            address: "123 MG Road",
            city: "Kolkata",
            state: "West Bengal",
            postalCode: "700001",
            status: "ACTIVE",
            ownerId: admin.id,
          },
        });

    console.log(`✅ Salon ready: ${salon.name}`);

    // ---------------------------------------------------------
    // 4. STAFF USERS
    // ---------------------------------------------------------

    const staffData = [
      {
        name: "Rahul Sharma",
        email: "rahul@demo-salon.com",
        phone: "9000000011",
        displayName: "Rahul",
        specialization: "Hair Styling & Cutting",
        bio: "Senior stylist specializing in modern haircuts and styling.",
        experienceYears: 8,
      },
      {
        name: "Priya Singh",
        email: "priya@demo-salon.com",
        phone: "9000000012",
        displayName: "Priya",
        specialization: "Hair Coloring",
        bio: "Professional hair colorist specializing in modern coloring techniques.",
        experienceYears: 6,
      },
      {
        name: "Neha Das",
        email: "neha@demo-salon.com",
        phone: "9000000013",
        displayName: "Neha",
        specialization: "Facial & Beauty Therapy",
        bio: "Beauty therapist specializing in facials, skincare and manicure services.",
        experienceYears: 5,
      },
    ];

    const staffRecords = [];

    for (const staffItem of staffData) {
      const user = await prisma.user.upsert({
        where: {
          email: staffItem.email,
        },
        update: {
          name: staffItem.name,
          phone: staffItem.phone,
          passwordHash: staffPasswordHash,
          role: "STAFF",
        },
        create: {
          name: staffItem.name,
          email: staffItem.email,
          phone: staffItem.phone,
          passwordHash: staffPasswordHash,
          role: "STAFF",
        },
      });

      const existingStaff = await prisma.staff.findUnique({
        where: {
          userId: user.id,
        },
      });

      const staff = existingStaff
        ? await prisma.staff.update({
            where: {
              id: existingStaff.id,
            },
            data: {
              salonId: salon.id,
              displayName: staffItem.displayName,
              specialization: staffItem.specialization,
              bio: staffItem.bio,
              experienceYears: staffItem.experienceYears,
              active: true,
            },
          })
        : await prisma.staff.create({
            data: {
              userId: user.id,
              salonId: salon.id,
              displayName: staffItem.displayName,
              specialization: staffItem.specialization,
              bio: staffItem.bio,
              experienceYears: staffItem.experienceYears,
              active: true,
            },
          });

      staffRecords.push(staff);

      console.log(
        `✅ Staff ready: ${staff.displayName}`,
      );
    }

    // ---------------------------------------------------------
    // 5. SERVICES
    // ---------------------------------------------------------

    const servicesData = [
      {
        name: "Classic Haircut",
        description:
          "Professional haircut with styling and finishing.",
        price: 350,
        durationMinutes: 30,
      },
      {
        name: "Premium Hair Styling",
        description:
          "Professional styling for parties, events and special occasions.",
        price: 700,
        durationMinutes: 60,
      },
      {
        name: "Hair Coloring",
        description:
          "Professional hair coloring service using premium products.",
        price: 1800,
        durationMinutes: 120,
      },
      {
        name: "Beard Trim",
        description:
          "Professional beard trimming and shaping.",
        price: 200,
        durationMinutes: 20,
      },
      {
        name: "Luxury Facial",
        description:
          "Deep cleansing and relaxing facial treatment.",
        price: 1200,
        durationMinutes: 60,
      },
      {
        name: "Manicure",
        description:
          "Complete manicure with nail shaping and finishing.",
        price: 600,
        durationMinutes: 45,
      },
    ];

    const serviceRecords = [];

    for (const serviceItem of servicesData) {
      const existingService = await prisma.service.findFirst({
        where: {
          salonId: salon.id,
          name: serviceItem.name,
        },
      });

      const service = existingService
        ? await prisma.service.update({
            where: {
              id: existingService.id,
            },
            data: {
              description: serviceItem.description,
              price: serviceItem.price,
              durationMinutes: serviceItem.durationMinutes,
              active: true,
            },
          })
        : await prisma.service.create({
            data: {
              salonId: salon.id,
              name: serviceItem.name,
              description: serviceItem.description,
              price: serviceItem.price,
              durationMinutes: serviceItem.durationMinutes,
              active: true,
            },
          });

      serviceRecords.push(service);

      console.log(
        `✅ Service ready: ${service.name}`,
      );
    }

    // ---------------------------------------------------------
    // 6. STAFF ↔ SERVICES
    // ---------------------------------------------------------

    const rahul = staffRecords[0];
    const priya = staffRecords[1];
    const neha = staffRecords[2];

    const classicHaircut = serviceRecords.find(
      (service) => service.name === "Classic Haircut",
    );

    const hairStyling = serviceRecords.find(
      (service) => service.name === "Premium Hair Styling",
    );

    const hairColoring = serviceRecords.find(
      (service) => service.name === "Hair Coloring",
    );

    const beardTrim = serviceRecords.find(
      (service) => service.name === "Beard Trim",
    );

    const facial = serviceRecords.find(
      (service) => service.name === "Luxury Facial",
    );

    const manicure = serviceRecords.find(
      (service) => service.name === "Manicure",
    );

    if (
      !rahul ||
      !priya ||
      !neha ||
      !classicHaircut ||
      !hairStyling ||
      !hairColoring ||
      !beardTrim ||
      !facial ||
      !manicure
    ) {
      throw new Error(
        "Required staff or service records were not created.",
      );
    }

    const staffServices = [
      {
        staffId: rahul.id,
        serviceId: classicHaircut.id,
      },
      {
        staffId: rahul.id,
        serviceId: hairStyling.id,
      },
      {
        staffId: rahul.id,
        serviceId: beardTrim.id,
      },
      {
        staffId: priya.id,
        serviceId: classicHaircut.id,
      },
      {
        staffId: priya.id,
        serviceId: hairStyling.id,
      },
      {
        staffId: priya.id,
        serviceId: hairColoring.id,
      },
      {
        staffId: neha.id,
        serviceId: facial.id,
      },
      {
        staffId: neha.id,
        serviceId: manicure.id,
      },
    ];

    for (const relation of staffServices) {
      await prisma.staffService.upsert({
        where: {
          staffId_serviceId: {
            staffId: relation.staffId,
            serviceId: relation.serviceId,
          },
        },
        update: {},
        create: relation,
      });
    }

    console.log("✅ Staff-service relationships created");

    // ---------------------------------------------------------
    // 7. SALON WORKING HOURS
    // ---------------------------------------------------------
    //
    // dayOfWeek:
    // 0 = Sunday
    // 1 = Monday
    // 2 = Tuesday
    // 3 = Wednesday
    // 4 = Thursday
    // 5 = Friday
    // 6 = Saturday
    //

    const salonWorkingHours = [
      {
        dayOfWeek: 0,
        isClosed: true,
        openTime: null,
        closeTime: null,
      },
      {
        dayOfWeek: 1,
        isClosed: false,
        openTime: "10:00",
        closeTime: "20:00",
      },
      {
        dayOfWeek: 2,
        isClosed: false,
        openTime: "10:00",
        closeTime: "20:00",
      },
      {
        dayOfWeek: 3,
        isClosed: false,
        openTime: "10:00",
        closeTime: "20:00",
      },
      {
        dayOfWeek: 4,
        isClosed: false,
        openTime: "10:00",
        closeTime: "20:00",
      },
      {
        dayOfWeek: 5,
        isClosed: false,
        openTime: "10:00",
        closeTime: "20:00",
      },
      {
        dayOfWeek: 6,
        isClosed: false,
        openTime: "10:00",
        closeTime: "21:00",
      },
    ];

    for (const hours of salonWorkingHours) {
      await prisma.salonWorkingHour.upsert({
        where: {
          salonId_dayOfWeek: {
            salonId: salon.id,
            dayOfWeek: hours.dayOfWeek,
          },
        },
        update: {
          isClosed: hours.isClosed,
          openTime: hours.openTime,
          closeTime: hours.closeTime,
        },
        create: {
          salonId: salon.id,
          dayOfWeek: hours.dayOfWeek,
          isClosed: hours.isClosed,
          openTime: hours.openTime,
          closeTime: hours.closeTime,
        },
      });
    }

    console.log("✅ Salon working hours created");

    // ---------------------------------------------------------
    // 8. STAFF WORKING HOURS
    // ---------------------------------------------------------

    for (const staff of staffRecords) {
      for (const hours of salonWorkingHours) {
        await prisma.staffWorkingHour.upsert({
          where: {
            staffId_dayOfWeek: {
              staffId: staff.id,
              dayOfWeek: hours.dayOfWeek,
            },
          },
          update: {
            isClosed: hours.isClosed,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
          },
          create: {
            staffId: staff.id,
            dayOfWeek: hours.dayOfWeek,
            isClosed: hours.isClosed,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
          },
        });
      }
    }

    console.log("✅ Staff working hours created");

    // ---------------------------------------------------------
    // 9. SUMMARY
    // ---------------------------------------------------------

    console.log("");
    console.log("==========================================");
    console.log("🎉 SalonOS seed completed successfully!");
    console.log("==========================================");
    console.log("");
    console.log("🏪 Salon");
    console.log("   Demo Salon & Spa");
    console.log("");
    console.log("👤 ADMIN LOGIN");
    console.log("   Email:    admin@demo-salon.com");
    console.log("   Password: Admin@12345");
    console.log("");
    console.log("👨‍💼 STAFF LOGIN");
    console.log("   Rahul:    rahul@demo-salon.com");
    console.log("   Priya:    priya@demo-salon.com");
    console.log("   Neha:     neha@demo-salon.com");
    console.log("   Password: Staff@12345");
    console.log("");
    console.log(`💇 Services: ${serviceRecords.length}`);
    console.log(`👥 Staff: ${staffRecords.length}`);
    console.log("🕐 Working hours: Monday-Saturday");
    console.log("==========================================");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Seed failed:");
  console.error(error);
  process.exit(1);
});