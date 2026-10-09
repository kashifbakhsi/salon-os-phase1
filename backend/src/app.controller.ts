import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      name: "SalonOS API",
      phase: 1,
      status: "ready",
    };
  }
}
