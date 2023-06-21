import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
} from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AngularSvgIconModule],
    selector: "select-multiple",
    templateUrl: "./select-multiple.component.html",
    styleUrls: [],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: SelectMultipleComponent,
        },
    ],
})
export class SelectMultipleComponent implements ControlValueAccessor {
    @Input("completeSet") completeSet: { value: any; text: string }[];

    @Input('hintText') hintText: string = '';
    


    dropdownOpen: Boolean = false;

    // private variable: the subset of selected items
    private _selected_items: string[] = [];

    // get remainingItems() {
    //     return this.completeSet.filter(
    //         (item) => !this.selectedItems.find(x => x.value === item.value)
    //     )
    // }

    itemIsSelected(item: { value: any, text: string }) {
        return !!this.selectedItems.find((x) => x === item.value)
    }


    // getters and setters for the selected items
    get selectedItems(): Array<string> {
        return this._selected_items;
    }
   
    set selectedItems(value: Array<string>) {
        // when the items list is changed we trigger the onChange callback for the ControlValueAccessor interface
        this.onChange(value);
        this._selected_items = value;
    }

    // select term is a UI event listener
    selectItem(item: { text: string, value: any }) {

        const selected = this.itemIsSelected(item)
        if(selected){
            this.markAsTouched()
            this.selectedItems = this.selectedItems.filter((x) => x != item.value)
        }else{
            this.selectedItems = [...this.selectedItems, item.value]
            // if this is triggered, the UI has been touched, we mark the control as touched
            this.markAsTouched()
        }

    }

    constructor() { }

    // Implementing the ControlValueAccessor
    // Source: https://medium.com/@majdasab/implementing-control-value-accessor-in-angular-1b89f2f84ebf
    // property that holds the onChange function, can be private
    private onChange = (data) => { };

    // This will will write the value to the view if the the value changes occur on the model programmatically
    writeValue(obj: any): void {
        this.selectedItems = obj
    }

    // When the value in the UI is changed, this method will invoke a callback function
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    // onTouched callback for parent component
    onTouched = () => { };
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // ControlValueAccessor interface "touched" handling
    private _touched = false;

    private markAsTouched() {
        if (!this._touched) {
            this.onTouched();
            this._touched = true;
        }
    }
    //  ControlValueAccessor interface disabled State handling
    disabled: boolean = false;
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
