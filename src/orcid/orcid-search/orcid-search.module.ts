import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

@Module({

	imports: [
		AuthModule,
	],
	controllers: [],
})
export class OrcidSearchModule {

}
