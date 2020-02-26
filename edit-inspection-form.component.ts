
import {FormControl, FormGroup, FormBuilder,FormArray, Validators} from '@angular/forms';
import {Component,OnInit} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {User} from '../../../../_models/index';
import { AppService } from 'src/app/app-service/app.service';
import { MessageService } from 'src/app/_services/message.service';
@Component({
  selector: 'app-edit-inspection-form',
  templateUrl: './edit-inspection-form.component.html',
  styleUrls: ['./edit-inspection-form.component.css']
})
export class EditInspectionFormComponent implements OnInit {
  toppingsControl = new FormControl([]);
  submitted = false;
  inspectionForm:FormGroup;
  sections_attributes:FormArray;
  line_items_attributes:FormArray;
  pokemonGroups: User ;
  getRattingArray=[];
  ins_id;
  constructor(private fb:FormBuilder,private appService:AppService,private messageInfo: MessageService, public router:Router,
              private route: ActivatedRoute) {

  }
 
  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.ins_id = +params['id'];
      this.getInspectionOneById(this.ins_id);
    });
    this.createInspectionForm();
    this.getAllAccount();
    this.getAllRatings();
  }
  getInspectionOneById(id){
    this.appService.getInspectionById(id).subscribe(res =>console.log(res))
  }

  createInspectionForm():void {
    this.inspectionForm = this.fb.group({
      inspection_form: new FormControl('',[Validators.required]),
      account_ids:new FormControl([],),
      private: new FormControl(false),
      sections_attributes:this.fb.array([this.createItem()])
    });
  }
   // convenience getters for easy access to form fields
   get f() { return this.inspectionForm.controls; }
  createItem(): FormGroup {
    return this.fb.group({
      name: new FormControl('', [Validators.required]),
      line_items_attributes: new FormArray([])
    });
  }
  initOption():FormGroup{
    return this.fb.group({
      weight: new FormControl(''),
      name: new FormControl('',[Validators.required]),
      rating_type_id: new FormControl('',[Validators.required])
    });
  }

  getAttribute(form) {
    
    // if(form.controls.line_items_attributes.controls.length > 2){
    //   this.showTrashIcn = true;
    // }   
    return form.controls.line_items_attributes.controls;
  }

  addItem(): void {
    const control = <FormArray>this.inspectionForm.get('sections_attributes');
    control.push(this.createItem())
    // this.sections_attributes = this.inspectionForm.get('sections_attributes') as FormArray;
    // this.sections_attributes.push(this.createItem());
  }
  removeItem(i): void {
    const control = <FormArray>this.inspectionForm.get('sections_attributes');
    control.removeAt(i)
  }
  
  addNestedItem(i):void{

    const control = <FormArray>this.inspectionForm.get('sections_attributes')['controls'][i].get('line_items_attributes');
      control.push(this.initOption())
  }

  removeNestedItem(i,j):void{
    // if(j <= 2){
    //   this.showTrashIcn = false;
    // }
    const control = <FormArray>this.inspectionForm.get('sections_attributes')['controls'][i].get('line_items_attributes');
    control.removeAt(j)
  }

  getAllAccount(){
    this.appService.getAllAccountsFilter().subscribe(res => {
       if(res.success == 'true'){
         this.pokemonGroups = res.accounts;
       }
       console.log(this.pokemonGroups)
    });
  }
  getAllRatings(){
    this.appService.getAllRatings().subscribe(res =>{
      this.getRattingArray = [...res.rating_types];
      console.log(this.getRattingArray)
    });
  }
  ValidateText(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    else {
      let val = evt.target.value;
      if (val.length > 0) {
        var test = Number(val.match(/\d+/)[0]);
        return test > 0 ;
      }
    }
  }

  onToppingRemoved(topping: string) {
    // const toppings = this.toppingsControl.value as string[];
    const toppings = this.inspectionForm.controls['account_ids'].value as string[];
    this.removeFirst(toppings, topping);
    this.inspectionForm.controls['account_ids'].setValue(toppings); // To trigger change detection
  }

  private removeFirst<T>(array: T[], toRemove: T): void {
    const index = array.indexOf(toRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }
  onSubmitForm(){
    this.submitted = true;
    if (this.inspectionForm.invalid) {
      return false;
    }
    console.log(this.inspectionForm.value)
    const account_id = this.inspectionForm.controls['account_ids'].value.map( value => value.id);
    let row={
      inspection_form:{
        name:this.inspectionForm.controls['inspection_form'].value,
        account_ids: account_id,
        private:this.inspectionForm.controls['private'].value,
        sections_attributes:this.inspectionForm.controls['sections_attributes'].value
      }
  
    }
    console.log(row)
    this.appService.createInspectionForm(row).subscribe(res =>{
      if(res.success == 'true'){
        this.messageInfo.openSnackBar(res.message,'Dismiss');
        this.inspectionForm.reset();
        this.router.navigate(['/settings/inspection_forms']);
      }
    });
  }

}
