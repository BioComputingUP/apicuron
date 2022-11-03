import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { TermDto, TermFilterDto } from './dto/term.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { Term, TermDocument } from './schemas/terms.schema';
import { Report, ReportDocument } from '../reports/reports.schema';

@Injectable()
export class TermsService {

    constructor(
        @InjectModel(Term.name) protected termModel: Model<TermDocument>,
        @InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
        protected resourceService: PartnerResourcesService
        ) { }

    async get_terms(term_list: string[], resource_id: string) {
        return await this.termModel.find({ term_activity: { $in: term_list }, resource_id }).lean()
    }

    async get_resource_terms(term_filter: TermFilterDto) {
        return await this.termModel.find(term_filter)
    }

    async resource_has_term(resource_id: string, activity_term: string) {
        return ! await this.termModel.exists({ resource_id, activity_term })
    }


    async update_term(term: UpdateTermDto) {
        const { resource_id, activity_term } = term
        const result = await this.termModel.updateOne({ resource_id, activity_term }, term)
        console.log(result)
    }

    async create_term(term: TermDto) {

        const resource_uri = await this.resourceService.retrieve_uri(term.resource_id);

        const termDocument = await this.termModel.create({ ...term, resource_uri })
        return termDocument.save();

    }

    async delete_term(term: DeleteTermDto) {
        const response = await this.termModel.deleteOne(term)

        if (response.deletedCount == 1) {
            return true
        } else {
            return false;
        }
    }
}
