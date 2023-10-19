import { CreateBadgeDefDto } from './badge-crud.dto';
import { CreateMedalDto } from './medal-crud.dto';

export class ResourceAchievmentsDef {
	medals: CreateMedalDto[];
	badges: CreateBadgeDefDto[];
}
