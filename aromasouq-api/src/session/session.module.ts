import { Module, Global } from '@nestjs/common';
import { SessionService } from './session.service';

@Global() // Make it available throughout the app
@Module({
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
