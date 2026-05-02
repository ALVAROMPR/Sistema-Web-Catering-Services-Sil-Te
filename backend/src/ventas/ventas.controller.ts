import { Controller, Get, Post, Body } from '@nestjs/common';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {
  constructor(private service: VentasService) {}

   @Get()
  getAll() {
    return this.service.findAll();
  }

  @Post()
  crear(@Body() body) {
    return this.service.crearVenta(body);
  }
}