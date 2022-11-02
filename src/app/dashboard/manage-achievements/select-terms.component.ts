import { Component, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";


@Component({
    selector: 'select-terms',
    template: `
        <div class="tw-p-1 tw-relative">
            <div class="tw-flex tw-flex-row tw-flex-wrap ">
                <span class="tw-bg-apicuron-purple tw-text-white tw-font-bold tw-text-sm tw-mr-1 tw-px-1 tw-rounded-full tw-mb-1" *ngFor="let term of selected_terms">
                    {{ term.activity_name }}
                    <button class="tw-ml-1 tw-text-center tw-align-middle " (click)="remove_term(term)">
                    <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </span>
            </div>
            <select name="" id="" class="tw-w-full" (change)="select_term($event)">
                <option selected hidden class="tw-text-gray-400">Select Term to add to list</option>
                <option *ngFor="let term of remaining_terms" (click)="select_term(term)" [value]="term.activity_term">{{ term.activity_name }}</option>
            </select>
        </div>
    `,
    styleUrls: ['./manage-badges/manage-badges.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: SelectTermsComponent
        }
    ]
})
export class SelectTermsComponent implements ControlValueAccessor {

    // the full list of terms to select from
    @Input('terms_list') terms_list: Array<any>;

    _selected_activity_terms: Array<any> = []
    disabled: boolean;


    hide_suggestions = true;

    // gets the list of selected terms from the list of activity_terms
    get selected_terms() {
        // we filter the full list of terms based on the selected terms
        return this.terms_list.filter(x => this.selected_activity_terms.includes(x.activity_term))
    }

    // getters and setters for the selected activity_terms
    get selected_activity_terms(): Array<any> {
        return this._selected_activity_terms
    }

    set selected_activity_terms(value: Array<any>) {
        // when the activity_terms list is changed we trigger the onChange callback for the ControlValueAccessor interface
        this.onChange(value);
        this._selected_activity_terms = value
    }

    // select term is a UI event listener
    select_term($event: any){
        // if this is triggered, the UI has been touched, we mark the control as touched
        this.markAsTouched()

        // get the activity_term
        const activity_term = $event.target.value
        // set the select option value back to '' and resetting the selection
        $event.target.value = ''
        // add the term to the selected activity_terms
        this.selected_activity_terms = [...this.selected_activity_terms, activity_term]
    }

    // this gets the list of remaining (not selected terms) to be used for the selection interface
    get remaining_terms (){
        
        return this.terms_list.filter(
            (term) => {
                return !this.selected_activity_terms.includes(term.activity_term)
            }
        )
    }

    // remove term is a simple function that removes a term form the selected_activity_term list
    remove_term(term: any) {
        this.selected_activity_terms = this.selected_activity_terms.filter(x => x != term.activity_term);
    }


    // ControlValueAccessor Interface Implementation
    // this is the function used by the parent form to mutate the state of the control when in need
    writeValue(obj: Array<any>): void {
        this.selected_activity_terms = obj
    }

    // on change callback for parent component
    onChange = (terms_list) => { }
    // registration of the onChange callback by the parent
    registerOnChange(fn: any): void {
        this.onChange = fn
    }

    // onTouched callback for parent component
    onTouched = () => { }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // ControlValueAccessor interface "touched" handling 
    private _touched = false;

    private markAsTouched(){
        if(!this._touched){
            this.onTouched();
            this._touched = true
        }
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

}