import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Usuario } from './usuarios/usuario.entity';
import { Cliente } from './clientes/cliente.entity';
import { Producto } from './productos/producto.entity';
import { VentasController } from './ventas/ventas.controller';
import { VentasService } from './ventas/ventas.service';
import { Venta } from './ventas/venta.entity';
import { DetalleVenta } from './ventas/detalle.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VentasModule } from './ventas/ventas.module';
import { ClientesModule } from './clientes/clientes.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      //entities: [Usuario, Cliente, Producto, Venta, DetalleVenta],
      autoLoadEntities: true,
      synchronize: false, // IMPORTANTE (usar false en producción)
    }),
    ClientesModule,
    VentasModule,
    TypeOrmModule.forFeature([Usuario, Cliente, Producto, Venta, DetalleVenta]),
  ],
  controllers: [AppController, VentasController],
  providers: [AppService, VentasService],
})
export class AppModule {}
//console.log('DB_PASS:', process.env.DB_PASS);
