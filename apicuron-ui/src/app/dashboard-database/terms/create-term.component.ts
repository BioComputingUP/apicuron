import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, Validators } from "@angular/forms";


@Component({
    standalone: true,
    selector: 'create-term',
    imports: [
        CommonModule,
        FormsModule,
    ],
    template: `
    
    <form action="" [formGroup]="form" (submit)="submit_form()">
        <div
            class="tw-bg-white tw-grid tw-grid-flow-row tw-gap-2 tw-px-4 tw-pt-5 tw-pb-4 sm:tw-p-6 sm:tw-pb-4">

            <h2 class="tw-text-xl tw-text-center tw-font-bold">Create
                Term</h2>
            
            <div class="form-control-element">
                <label for="activity_term">Activity term</label>
                <input type="text" name="" id="" formControlName="activity_term">
            </div>

            <div class="form-control-element">
                <label for="activity_name">Activity name</label>
                <input type="text" name="" id="" formControlName="activity_name">
            </div>

            <div class="form-control-element">
                <label for="activity_category">Activity Category</label>
                <select class="text-input" formControlName="activity_category" >
                    <option class="tw-p-2 tw-bg-white tw-shadow-md tw-text-gray-900"
                        *ngFor="let category of activity_categories"
                        [value]="category">
                        {{ category }}
                    </option>
                </select>
            </div>

            <div class="form-control-element">
                <label for="score">Score</label>
                <input type="number" min="1" name="score" formControlName="score" id="">
            </div>

            <div class="form-control-element">
                <label for="description">Description</label>
                <textarea formControlName="description" name="description" id="" cols="30"
                    rows="5"></textarea>
            </div>

            <input type="submit" class="tw-w-full tw-p-2 tw-mx-1 tw-bg-green-500 tw-text-white"
                value="submit">


        </div>
    </form>
    
    `,
    styleUrls: []
})
class CreateTermComponent implements OnInit {

    form: FormGroup

    @Input()
    resource_id: string

    constructor(
        protected formBuilder: FormBuilder,
    ) {
        this.form = this.formBuilder.group({
            resource_id: [this.resource_id, [Validators.required]],
            activity_term: ["", [Validators.required]],
            activity_category: ["generation", [Validators.required]],
            activity_name: ["", [Validators.required]],
            score: ["", [Validators.required, Validators.min(1)]],
            description: ["", [Validators.required]],
        })
    }


    submit_form(){
        console.log('submit', this.form.value)
    }

    ngOnInit(): void {

    }

}