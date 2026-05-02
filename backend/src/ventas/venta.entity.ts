import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DetalleVenta } from './detalle.entity';

@Entity('ventas')
export class Venta {

  @PrimaryGeneratedColumn()
  id_venta: number;

  @Column()
  id_cliente: number;

  @Column()
  id_usuario: number;

  @Column('decimal')
  total: number;

  @Column()
  fecha: Date;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta)
  detalles: DetalleVenta[];

}