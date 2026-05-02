import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  findAll() {
    return this.clienteRepo.find({
      where: { estado: true },
      order: { id_cliente: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.clienteRepo.findOne({
      where: { id_cliente: id },
    });
  }

  create(data: any) {
    const cliente = this.clienteRepo.create({
      codigo_cliente: data.codigo_cliente,
      nombre_completo: data.nombre_completo,
      id_cargo: data.id_cargo,
      creado_por: data.creado_por,
      estado: true,
    });

    return this.clienteRepo.save(cliente);
  }

  async update(id: number, data: any) {
    const cliente = await this.findOne(id);

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    await this.clienteRepo.update(
      { id_cliente: id },
      {
        codigo_cliente: data.codigo_cliente ?? cliente.codigo_cliente,
        nombre_completo: data.nombre_completo ?? cliente.nombre_completo,
        id_cargo: data.id_cargo ?? cliente.id_cargo,
      },
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    const cliente = await this.findOne(id);

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    await this.clienteRepo.update(
      { id_cliente: id },
      { estado: false },
    );

    return {
      message: 'Cliente desactivado correctamente',
    };
  }
}