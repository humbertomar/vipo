import { Controller, Get } from '@nestjs/common';

/**
 * Controller para verificar saúde da API
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

