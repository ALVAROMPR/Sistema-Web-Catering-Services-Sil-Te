import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id_producto: number;

  @Column()
  nombre: string;

  @Column('decimal')
  precio: number;

  @Column()
  stock: number;

   @Column({ default: true })
  tiene_stock: boolean;
}