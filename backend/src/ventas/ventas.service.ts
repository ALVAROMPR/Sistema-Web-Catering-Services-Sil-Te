import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './venta.entity';
import { DetalleVenta } from './detalle.entity';

import { Cliente } from '../clientes/cliente.entity';
import { Repository } from 'typeorm';
import { Producto } from '../productos/producto.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,

    @InjectRepository(DetalleVenta)
    private detalleRepo: Repository<DetalleVenta>,

    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,

    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,

  ) {}
async findAll() {
  return this.ventaRepo.find({
    relations: ['detalles'],
  });
}
  async crearVenta(data) {

    const cliente = await this.clienteRepo.findOne({
  where: { id_cliente: data.id_cliente },
});

if (!cliente) {
  throw new BadRequestException('Cliente no existe');
}

if (!cliente.estado) {
  throw new BadRequestException('Cliente inactivo');
}

    const venta = await this.ventaRepo.save({
      id_cliente: data.id_cliente,
      id_usuario: 1,
      total: data.total,
    });

    for (const item of data.detalle) {

      const producto = await this.productoRepo.findOne({
        where: { id_producto: item.id_producto },
      });

      if (!producto) {
        throw new BadRequestException(`Producto ${item.id_producto} no existe`);
      }

      // 🔥 VALIDACIÓN CORRECTA
      if (Number(producto.stock) <= 0) {
        throw new BadRequestException(`El producto ${producto.nombre} no tiene stock`);
      }

      if (Number(producto.stock) < Number(item.cantidad)) {
        throw new BadRequestException(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
        );
      }

      const subtotal = item.cantidad * item.precio_unitario;

      // await this.detalleRepo.save({
      //   id_venta: venta.id_venta,
      //   id_producto: item.id_producto,
      //   cantidad: item.cantidad,
      //   precio_unitario: item.precio_unitario,
      //   subtotal: subtotal,
      // });
      await this.detalleRepo.save({
  venta: venta,
  producto: producto,
  cantidad: item.cantidad,
  precio_unitario: item.precio_unitario,
  subtotal: subtotal,
});

      producto.stock = producto.stock - item.cantidad;

      if (producto.stock === 0) {
        producto.tiene_stock = false;
      }

      await this.productoRepo.save(producto);
    }

    return venta;
  }
}