import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AchievmentsDefService } from '../achievements.service';
import { uniqueNameValidator } from '../validators/unique-name.validator';


@Component({
    selector: 'manage-medals',
    templateUrl: './manage-medals.component.html',
    styleUrls: ['./manage-medals.component.scss']
})
export class ManageMedalsComponent implements OnInit {
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
    medals$ = new BehaviorSubject<Array<any>>([]);
    edit_form: FormGroup
    create_form: FormGroup

    ngOnInit(): void {
        this.resourceId$.pipe(
            switchMap((resource_id: string) => {
                return this.achievmentsDefService.get_resource_medals(resource_id)
            })
        ).subscribe((medals: any) => {
            this.medals$.next(medals)
        })
    }

    private update_medal(medal_update) {
        const medals = this.medals$.value;
        const update_index = medals.findIndex((medal) => medal.name == medal_update.name)
        medals[update_index] = medal_update
        this.medals$.next(medals);
    }

    private create_medal(medal) {
        const medals = this.medals$.value;
        this.medals$.next([medal, ...medals]);
    }

    open_edit_modal(medal) {
        this.edit_form = this.formBuilder.group({
            name: [medal.name, [Validators.required]],
            category: [medal.category, [Validators.required]],
            color: [medal.color, [Validators.required, Validators.pattern(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/)]],
            score_relative: [medal.score_relative, [Validators.required, Validators.min(1)]],
            list_terms: [medal.list_terms, [Validators.required]],
            first_day: [medal['first_day'] || '', []],
            last_day: [medal['last_day'] || '', []]
        })
        this.show_edit_form = true;
    }

    edit_form_submit() {
        const data = this.edit_form.value
        if(!data['first_day'])
        {
            delete data['first_day']
        }
        if(!data['last_day'])
        {
            delete data['last_day']
        }
        this.resource$.pipe(
            map(({ resource_id, resource_uri }: any) => {
                return {
                    ...data,
                    resource_id,
                    resource_uri
                }
            }),
            switchMap((medal_data: any) => {
                return this.achievmentsDefService.update_medal(medal_data)
            })
        ).subscribe(
            (response) => {
                if (response['data']) {
                    this.toastr.success(`Medal ${data.name} sucessfully update`, 'Medal Update Sucessfull');
                    this.update_medal(response['data'])
                }
            },
            (error) => {
                this.toastr.error(`An error occured while updating the Medal ${data.name}`, 'Medal Update Failed')
            }
        )
    }

    open_create_modal() {
        this.create_form = this.formBuilder.group({
            color: ['', [Validators.required, Validators.pattern(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/)]],
            score_relative: ['', [Validators.required, Validators.min(1)]],
            first_day: ['', []],
            last_day: ['', []],
            name: ['', [Validators.required]],
            category: ['', [Validators.required]],
            list_terms: [[], [Validators.required]]
        })
        this.show_create_form = true;
    }

    create_form_submit() {
        const data = this.create_form.value
        if(!data['first_day'])
        {
            delete data['first_day']
        }
        if(!data['last_day'])
        {
            delete data['last_day']
        }
        this.resource$.pipe(
            map(({ resource_id, resource_uri }: any) => {
                return {
                    ...data,
                    resource_id,
                    resource_uri
                }
            }),
            switchMap((medal_data: any) => {
                return this.achievmentsDefService.create_medal(medal_data)
            })
        ).subscribe(
            (response) => {
                if (response['data']) {
                    this.toastr.success(`Medal ${data.name} sucessfully Created`, 'Medal Creation Sucessfull');
                    this.create_medal(response['data'])
                }
            },
            (error) => {
                this.toastr.error(`An error occured while updating the Medal ${data.name}`, 'Medal Update Failed')
            }
        )
    }

    get edit_form_color() {
        return this.edit_form.get('color')
    }

    get create_form_color() {
        return this.create_form.get('color')
    }

    delete_medal(medal) {
        this.achievmentsDefService.delete_medal(medal).subscribe(
            (response) => {
                if (response['data']) {
                    this.toastr.success(`medal ${medal.name} sucessfully Created`, 'medal Creation Sucessfull');
                    const medals = this.medals$.value;
                    const filtered_medals = medals.filter(x => x.name != medal.name)
                    this.medals$.next(filtered_medals)
                }
            },
            (error) => {
                this.toastr.error(`An error occured while updating the medal ${medal.name}`, 'medal Update Failed')
            }
        )
    }
}