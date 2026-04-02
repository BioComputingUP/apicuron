import {
	SubmitWorkReponseWithCode,
	SubmitWorkResponse,
} from '../interfaces/orcid.interface';

export function responseHasCode(
	response: SubmitWorkResponse,
	code = 201,
): response is SubmitWorkReponseWithCode {
	return response.status === code;
}
