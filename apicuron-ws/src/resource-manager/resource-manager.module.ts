import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ResourceManagersController } from './controllers/resource-managers.controller';
import { ResourceManagerGuard } from './guards/resource-manager-only.guard';
import { ResourceManagerService } from './services/resource-manager.service';

@Module({
	imports: [CoreApicuronModule, AuthModule, JwtModule, NotificationsModule],
	controllers: [ResourceManagersController],
	providers: [ResourceManagerGuard, ResourceManagerService],
	exports: [ResourceManagerGuard, ResourceManagerService],
})
export class ResourceManagerModule {}
