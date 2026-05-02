import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from './venta.entity';
import { Producto } from '../productos/producto.entity';

@Entity('detalle_venta')
export class DetalleVenta {

  @PrimaryGeneratedColumn()
  id_detalle: number;

  @Column()
  id_producto: number;

  @Column()
  cantidad: number;

  @Column()
  precio_unitario: number;

  @Column()
  subtotal: number;

  // 🔥 RELACIÓN CORREGIDA
  @ManyToOne(() => Venta, (venta) => venta.detalles)
  @JoinColumn({ name: 'id_venta' }) // 👈 CLAVE
  venta: Venta;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'id_producto' }) // 👈 opcional pero recomendado
  producto: Producto;
}