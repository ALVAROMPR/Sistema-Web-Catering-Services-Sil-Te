import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Venta } from './venta.entity';
import { DetalleVenta } from './detalle.entity';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Producto } from 'src/productos/producto.entity';
import { Cliente } from 'src/clientes/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetalleVenta, Producto, Cliente])],
  providers: [VentasService],
  controllers: [VentasController],
})
export class VentasModule {}