import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductosService {

  constructor(
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,
  ) {}

  async findAll() {
    return this.productoRepo.find();
  }

}