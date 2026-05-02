import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {

  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientesService.findOne(Number(id));
  }

  @Post()
  create(@Body() body) {
    return this.clientesService.create({
      codigo_cliente: body.codigo_cliente,
      nombre_completo: body.nombre_completo,
      id_cargo: body.id_cargo,
      creado_por: body.creado_por,
      estado: true
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.clientesService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientesService.remove(Number(id));
  }

}