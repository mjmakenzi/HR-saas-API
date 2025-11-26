import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { User } from './users/entities/user.entity';
import { Evaluation } from './evaluations/entities/evaluation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const rawDbName = configService.get<string>('DB_NAME');
        const normalizedDbName =
          rawDbName?.startsWith('"') && rawDbName?.endsWith('"')
            ? rawDbName.slice(1, -1)
            : rawDbName?.toLowerCase();

        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: normalizedDbName,
          entities: [User, Evaluation],
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') === 'development',
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    EvaluationsModule,
  ],
})
export class AppModule {}
