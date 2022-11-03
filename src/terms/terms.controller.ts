import { Query, Controller, Get, Post, Param, Put, Delete, Body, UseGuards, Req, ForbiddenException, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { CreateTermDto } from './dto/createTerm.dto';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { TermDto, TermFilterDto } from './dto/term.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { TermsService } from './terms.service';
@ApiTags('Curation Terms')
@Controller({
    path: 'terms',
    version: '2'
})
export class TermsController {

    constructor(private termsService: TermsService) {}

    private can_edit_resource(user, resource_id){
        // get the resources list that belong to the current user
        const user_resources: Array<{ resource_id: string}> = user.resources
        // check if the resource belongs to the user
        const resource_found = user_resources.find(resource => resource.resource_id == resource_id)
        // if it doesn't, we respond with  a 403 exception
        if(!resource_found){
            throw new ForbiddenException(`You either do not have the authorization to update the terms of the (${resource_id}) resource or the resource does not exist`);
        }
    }

    @Get('')
    get_terms(@Query() term_filter: TermFilterDto ){
        return this.termsService.get_resource_terms(term_filter);
    }


    @Post('')
    @UseGuards(LocalAuthGuard, HasAResourceGuard)
    create_term(@Body() term: CreateTermDto, @Req() req){
        this.can_edit_resource(req.user, term.resource_id)
        
        return this.termsService.create_term(term);
    }

    @Put('edit')
    @UseGuards(LocalAuthGuard, HasAResourceGuard)
    update_term(@Body() term: UpdateTermDto, @Req() req){
        this.can_edit_resource(req.user, term.resource_id)

        return this.termsService.update_term(term)
    }

    @Delete(':activity_term/partner-resource/:resource_id')
    @UseGuards(LocalAuthGuard, HasAResourceGuard)
    delete_term(@Param() delete_term: DeleteTermDto, @Req() req){
        const { resource_id } = delete_term;
        this.can_edit_resource(req.user, resource_id)

        return this.termsService.delete_term(delete_term)
    }
}
