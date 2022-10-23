import { Controller, Get, UseGuards, Req, Delete, Param } from '@nestjs/common';
import mongoose from 'mongoose';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller({
    path: 'notifications',
    version: '2'
})
export class NotificationsController {

    constructor (private notificationService: NotificationsService){}

    @Get()
    @UseGuards(LocalAuthGuard)
    async get_user_notification(@Req() request) {
        return await this.notificationService.get_new_user_notification(request.user.orcid_id)
    }

    @Get('count')
    @UseGuards(LocalAuthGuard)
    async get_new_notification_count(@Req() request){
        return await this.notificationService.get_new_notification_count(request.user.orcid_id)
    }

    @Delete()
    @UseGuards(LocalAuthGuard)
    async clear_notifications(@Req() request){
        return await this.notificationService.clear_user_notifications(request.user.orcid_id)
    }

    @Delete(':notification_id')
    @UseGuards(LocalAuthGuard)
    async delete_notification(@Req() request, @Param('notification_id') notification_id: mongoose.Types.ObjectId){
        return await this.notificationService.set_notification_as_seen(notification_id  ,request.user.orcid_id)
    }


}
