import {
	SubmitWorkReponseWithCode,
	SubmitWorkResponse,
} from '../interfaces/orcid.interface';

export function responseHasCode(
	response: SubmitWorkResponse,
): response is SubmitWorkReponseWithCode {
	return response.status === 201;
}
