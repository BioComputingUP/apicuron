import { Query, Controller, Get, Post, Param, Put, Delete, Body, UseGuards, Req, ForbiddenException, ValidationPipe } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { AuthorizationHeader, VersionHeader } from '../config/swagger';
import { CreateTermDto } from './dto/createTerm.dto';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { TermDto, TermFilterDto } from './dto/term.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { TermsService } from './terms.service';
@ApiTags('Curation Terms')
@ApiHeader(VersionHeader)
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
    // swagger decorators
    @ApiOkResponse({
        description: 'a list of Terms filtered by the specified parameters',
        type: Array<CreateTermDto>
    })
    @ApiOperation({
        summary: 'Get a list of Terms that describe minimal curation efforts in specific databases'
    })
    // nestjs decorators
    @Get('')
    get_terms(@Query() term_filter: TermFilterDto ){
        return this.termsService.get_resource_terms(term_filter);
    }

    // swagger decorators
    @ApiOperation({
        summary: 'Create a Term for a Specific Resource Partner, You need to own permissions for the specified Partner Resource'
    })
    @ApiOkResponse({
        description: 'Confirmation object of the created Term',
        type: CreateTermDto
    })
    @ApiHeader(AuthorizationHeader)
    // nestjs decorators
    @Post('')
    @UseGuards(LocalAuthGuard, HasAResourceGuard)
    create_term(@Body() term: CreateTermDto, @Req() req){
        this.can_edit_resource(req.user, term.resource_id)
        
        return this.termsService.create_term(term);
    }

    @ApiOperation({
        summary: 'Update a Term for a Specific Resource Partner, You need to own permissions for the specified Partner Resource'
    })
    @ApiOkResponse({
        description: 'Confirmation object of the edited Term',
        type: CreateTermDto
    })
    @ApiHeader(AuthorizationHeader)
    // nestjs decorators
    @Put('edit')
    @UseGuards(LocalAuthGuard, HasAResourceGuard)
    update_term(@Body() term: UpdateTermDto, @Req() req){
        this.can_edit_resource(req.user, term.resource_id)

        return this.termsService.update_term(term)
    }

    @ApiOperation({
        summary: 'Delete a Term from a Specific Resource Partner, You need to own permissions for the specified Partner Resource'
    })
    @ApiOkResponse({
        description: 'A Boolean confirming the deletion of the Term',
        type: CreateTermDto
    })
    @ApiHeader(AuthorizationHeader)
    @Delete(':activity_term/partner-resource/:resource_id')
    @UseGuards(LocalAuthGuard, HasAResourceGuard)
    delete_term(@Param() delete_term: DeleteTermDto, @Req() req){
        const { resource_id } = delete_term;
        this.can_edit_resource(req.user, resource_id)

        return this.termsService.delete_term(delete_term)
    }
}
