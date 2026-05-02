import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  nombre_completo: string;

  @Column()
  id_rol: number;
}