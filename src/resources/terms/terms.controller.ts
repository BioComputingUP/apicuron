import { Query, Controller, Get, Post, Body, UseGuards, Req, ForbiddenException, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { TermDto } from '../dto/term.dto';
import { TermsService } from './terms.service';

@Controller({
    path: 'terms',
    version: '2'
})
export class TermsController {

    constructor(private termsService: TermsService) {}

    @Get('')
    get_terms(@Query('resource_id') resource_id ){
        if(resource_id){
            return this.termsService.get_resource_terms(resource_id);
        }
    }


    @Post('')
    @UseGuards(LocalAuthGuard, HasAResourceGuard)
    create_term(@Body() term: TermDto, @Req() req){
        // const resource_found = req.user.resources.find(resource => resource.resource_id == term.resource_id)
        const user_resources: Array<{ resource_id: string}> = req.user.resources
        const resource_found = user_resources.find(resource => resource.resource_id == term.resource_id)
        if(!resource_found){
            throw new ForbiddenException(`You do not have the authorization to update the terms of the (${term.resource_id}) resource`);
        }
        
        return this.termsService.create_term(term);

    }
}
