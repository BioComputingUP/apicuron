import { Module } from '@nestjs/common';
import { CoreApicuronModule } from 'src/core/core.module';

@Module({
	imports: [CoreApicuronModule],
})
export class PendingReportsModule {}
