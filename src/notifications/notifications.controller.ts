import { Controller, Get, UseGuards, Req, Delete, Param } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { AuthorizationHeader, VersionHeader } from '../config/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiHeader(VersionHeader)
@ApiHeader(AuthorizationHeader)
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

    @ApiOperation({
        description: 'Get the number of unseen notifications',
        
    })
    @Get('count')
    @UseGuards(LocalAuthGuard)
    async get_new_notification_count(@Req() request){
        return await this.notificationService.get_new_notification_count(request.user.orcid_id)
    }

    @ApiOperation({
        description: 'Delete all user notifications',  
    })
    @Delete()
    @UseGuards(LocalAuthGuard)
    async clear_notifications(@Req() request){
        return await this.notificationService.clear_user_notifications(request.user.orcid_id)
    }

    @ApiOperation({
        description: 'Delete a specific notification',  
    })
    @Delete(':notification_id')
    @UseGuards(LocalAuthGuard)
    async delete_notification(@Req() request, @Param('notification_id') notification_id: mongoose.Types.ObjectId){
        return await this.notificationService.set_notification_as_seen(notification_id  ,request.user.orcid_id)
    }


}
