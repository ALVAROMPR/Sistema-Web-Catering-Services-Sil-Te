import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clientes')
export class Cliente {  
  @PrimaryGeneratedColumn()
  id_cliente!: number;

  @Column()
  codigo_cliente!: string;

  @Column()
  nombre_completo!: string;

  @Column()
  id_cargo!: number;

  @Column()
  estado!: boolean;

  @Column()
  creado_por!: number;

  // @Column()
  // fecha_creacion: Date;
  @Column({ type: 'timestamp' })
  fecha_creacion!: Date;

}