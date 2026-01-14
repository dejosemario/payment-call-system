import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { Connection } from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('DATABASE_URL');
        console.log('Attempting to connect to MongoDB...');
        return {
          uri,
          dbName: 'paymentSystemDb',
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              console.log(
                `Successfully connected to database: ${connection.db.databaseName}`,
              );
            });

            connection.on('error', (err: Error) => {
              console.error('Database connection error:', err);
            });

            connection.on('disconnected', () => {
              console.warn('Database disconnected');
            });

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
