import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TermDto } from '../dto/term.dto';
import { PartnerResourcesService } from '../partner-resources/partner-resources.service';
import { Term, TermDocument } from '../schemas/terms.schema';

@Injectable()
export class TermsService {

    constructor(@InjectModel(Term.name) protected termModel: Model<TermDocument>, protected resourceService: PartnerResourcesService) {}

    async get_terms(term_list: string[], resource_uri:string){
        return await this.termModel.find({ term_activity: { $in: term_list }, resource_uri }).lean()
    }

    async get_resource_terms(resource_id: string){
        return await this.termModel.find({ resource_id })
    }

    async resource_has_term(resource_id: string, activity_term: string){
        return ! await this.termModel.exists({ resource_id, activity_term })
    }


    async create_term(term: TermDto){

        const resource_uri = await this.resourceService.retrieve_uri(term.resource_id);
        
        const termDocument = await this.termModel.create({...term, resource_uri })
        return termDocument.save();

    }
}
