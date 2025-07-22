import { ConfigurableModuleBuilder } from '@nestjs/common';
import { EventOrchestratorModuleOptions } from './interfaces/event-orchestrator-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<EventOrchestratorModuleOptions>().build();
