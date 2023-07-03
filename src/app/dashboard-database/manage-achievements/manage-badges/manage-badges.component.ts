import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AchievmentsDefService } from '../achievements.service';
import { uniqueNameValidator } from '../validators/unique-name.validator';


@Component({
    selector: 'manage-badges',
    templateUrl: './manage-badges.component.html',
    styleUrls: ['./manage-badges.component.scss']
})
export class ManageBadgesComponent implements OnInit {
    resourceId$: Observable<unknown>;

    constructor(protected route: ActivatedRoute, protected achievmentsDefService: AchievmentsDefService, protected formBuilder: FormBuilder, protected toastr: ToastrService) {

        this.resourceId$ = this.route.paramMap.pipe(
            map((params: ParamMap) => {
                return params.get('resource_id')
            })
        )
    }

    @Input() resource$: Observable<any>;
    @Input() terms$: Observable<any>;

    show_edit_form = false;
    show_create_form = false;
    badges$ = new BehaviorSubject<Array<any>>([]);
    edit_form: FormGroup
    create_form: FormGroup

    ngOnInit(): void {
        this.resourceId$.pipe(
            switchMap((resource_id: string) => {
                return this.achievmentsDefService.get_resource_badges(resource_id)
            })
        ).subscribe((badges: any) => {
            this.badges$.next(badges)
        })
    }

    private update_badge(badge_update){
        const badges=  this.badges$.value;
        const update_index = badges.findIndex((badge) => badge.name == badge_update.name)
        badges[update_index] = badge_update
        this.badges$.next(badges);
    }

    private create_badge(badge){
        const badges=  this.badges$.value;
        this.badges$.next([badge,...badges]);
    }

    open_edit_modal(badge) {
        this.edit_form = this.formBuilder.group({
            name: [badge.name, [Validators.required]],
            category: [badge.category, [Validators.required]],
            color_code: [badge.color_code, [Validators.required, Validators.pattern(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/)]],
            count_threshold: [badge.count_threshold, [Validators.required, Validators.min(1)]],
            list_terms: [badge.list_terms, [Validators.required]]
        })
        this.show_edit_form = true;
    }

    edit_form_submit() {
        const data = this.edit_form.value
        this.resource$.pipe(
            map(({ resource_id, resource_uri}: any) =>{
                return {
                    ...data,
                    resource_id,
                    resource_uri
                }
            }),
            switchMap((badge_data: any) => {
                return this.achievmentsDefService.update_badge(badge_data)
            })
        ).subscribe(
            (response) => {
                if(response['data']){
                    this.toastr.success(`Badge ${data.name} sucessfully update`, 'Badge Update Sucessfull');
                    this.update_badge(data)
                }
            },
            (error) => {
                this.toastr.error(`An error occured while updating the badge ${data.name}`, 'Badge Update Failed')
            }
        )
    }

    open_create_modal(){
        this.create_form = this.formBuilder.group({
            name: ['', [Validators.required]],
            category: ['', [Validators.required]],
            color_code: ['', [Validators.required, Validators.pattern(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/)]],
            count_threshold: [1, [Validators.required, Validators.min(1)]],
            list_terms: [[], [Validators.required]]
        })
        this.show_create_form = true;
    }

    create_form_submit(){
        const data = this.create_form.value
        this.resource$.pipe(
            map(({ resource_id, resource_uri}: any) =>{
                return {
                    ...data,
                    resource_id,
                    resource_uri
                }
            }),
            switchMap((badge_data: any) => {
                return this.achievmentsDefService.create_badge(badge_data)
            })
        ).subscribe(
            (response) => {
                if(response['data']){
                    this.toastr.success(`Badge ${data.name} sucessfully Created`, 'Badge Creation Sucessfull');
                    this.create_badge(response['data'])
                }
            },
            (error) => {
                this.toastr.error(`An error occured while updating the badge ${data.name}`, 'Badge Update Failed')
            }
        )
    }
    
    get edit_form_color_code(){
        return this.edit_form.get('color_code')
    }

    get create_form_color_code(){
        return this.create_form.get('color_code')
    }

    delete_badge(badge) {
        this.achievmentsDefService.delete_badge(badge).subscribe(
            (response) => {
                if(response['data']){
                    this.toastr.success(`Badge ${badge.name} sucessfully Created`, 'Badge Creation Sucessfull');
                    const badges = this.badges$.value;
                    const filtered_badges = badges.filter(x => x.name != badge.name)
                    this.badges$.next(filtered_badges)
                }
            },
            (error) => {
                this.toastr.error(`An error occured while updating the badge ${badge.name}`, 'Badge Update Failed')
            }
        )
    }
}