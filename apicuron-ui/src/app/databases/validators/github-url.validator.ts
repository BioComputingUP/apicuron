import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";
import { GITHUB_URL_PATTERN } from "src/app/models/types/constants";
import { ResourceCategory } from "src/app/models/types/enums";

/**
 * Validates the GitHub URL if the resource category matches the input category(ies)
 */
export class GithubUrlValidator {
    static createValidator(categories: Array<ResourceCategory>): ValidatorFn {
        return (form: FormGroup<{ category: AbstractControl<ResourceCategory>; resource_url: AbstractControl<string> }>) => {
            const category = form.controls.category.value;

            const resource_url = form.controls.resource_url.value;

            if (categories.includes(category)){
                const isValid = GITHUB_URL_PATTERN.test(resource_url);
                return isValid ? null : { invalidGithubUrl: true };
            }else{
                return null;
            }
        }
    }
}