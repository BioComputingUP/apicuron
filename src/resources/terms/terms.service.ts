import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Term, TermDocument } from '../schemas/terms.schema';

@Injectable()
export class TermsService {

    constructor(@InjectModel(Term.name) protected termModel: Model<TermDocument>) {}

    async get_terms(term_list: string[], resource_uri:string){
        return await this.termModel.find({ term_activity: { $in: term_list }, resource_uri }).lean()
    }
}
