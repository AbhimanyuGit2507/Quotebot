import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    // Import all feature modules here
    // ProductsModule,
    // ClientsModule,
    // RfqsModule,
    // QuotationsModule,
    // DashboardModule,
    // AnalyticsModule,
    // SettingsModule,
    // FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
