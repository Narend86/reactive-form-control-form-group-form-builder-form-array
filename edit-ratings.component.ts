import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { AppService } from 'src/app/app-service/app.service';
import { MessageService } from 'src/app/_services/message.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
@Component({
  selector: 'app-edit-ratings',
  templateUrl: './edit-ratings.component.html',
  styleUrls: ['./edit-ratings.component.css']
})
export class EditRatingsComponent implements OnInit {
  ratingForm: FormGroup;
  ratingListForm: FormGroup;
  rating_options_attributes: FormArray;
  attributes: FormArray;
  submitted = false;
  rSubmitted = false;
  rValue;
  formattedMessage;
  radioDefault = [];
  r_id;
  category: string;
  loader: boolean = true;
  percentageRating;
  listRating;
  deletedRow=[];
  constructor(private fb: FormBuilder, private appService: AppService, private messageInfo: MessageService, 
              private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.r_id = +params['id'];
      this.getRatingOneById(this.r_id);
    });
  }
  getRatingOneById(id) {
    this.appService.getRatingById(id).subscribe(res => {
      this.category = res.category;
      this.loader = false;
      if (this.category == 'percentage') {
        this.percentageRating = res;
        this.createForm();
      }
      else if (this.category == 'list') {
        this.listRating = res;
        this.createRatingListForm();
      }
      console.log(this.category)
      console.log(this.percentageRating)
      console.log(this.listRating)
    });
  }
  createForm(): void {
    this.ratingForm = this.fb.group({
      rating_type: new FormControl(this.percentageRating.name, [Validators.required]),
      rating_options_attributes: new FormArray([])
    });
    this.loadForm(this.percentageRating)
  }
  /*****load data for form array and set the value ******/
  loadForm(data) {
    console.log(data)
    //create lines array first
    const linesFormArray = this.ratingForm.get("rating_options_attributes") as FormArray;
   
    for (let i = 0; i < data.rating_items.length; i++) {
      if(data.rating_items[i].default == "1"){
        this.rValue = true;
      } 
      linesFormArray.push(this.fb.group({
        id:data.rating_items[i].id,
        default: data.rating_items[i].default == "1" ? new FormControl(this.rValue): new FormControl(),
        deficient: data.rating_items[i].deficient == "1" ? true:false,
        name: data.rating_items[i].name,
        value: data.rating_items[i].value
      }));

    }
    console.log(linesFormArray);
    this.ratingForm.setControl('rating_options_attributes', linesFormArray);
  }

/*****load data for form array and set the value ******/

createItem(): FormGroup {
  return this.fb.group({
    default: new FormControl(), // extra  defaultTrue: new FormControl(),
    deficient: new FormControl(false),
    name: new FormControl('', [Validators.required]),
    value: new FormControl('', [Validators.required])
  });
}

addItem(): void {
  this.rating_options_attributes = this.ratingForm.get('rating_options_attributes') as FormArray;
  this.rating_options_attributes.push(this.createItem());
}

removeItem(i,item): void {
  console.log(i,item)
  this.rating_options_attributes = this.ratingForm.get('rating_options_attributes') as FormArray;
  this.rating_options_attributes.removeAt(i)
  // this.attributes.push(this.createItem());
  this.deletedRow.push(item)
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
      return test > 0 && test <= 10;
    }
  }
}

onSubmit() {
  this.submitted = true;
  if (this.ratingForm.invalid) {
    return false;
  }
   this.deletedRow.map(value=>{value['is_deleted']=true});
  let row = {
    rating_type: {
      "name": this.ratingForm['controls'].rating_type.value,
      "category": "percentage",
      "rating_options_attributes": this.ratingForm.value.rating_options_attributes.concat(this.deletedRow)
    }
  }
  console.log(row)
  this.appService.editRating(this.r_id,row).subscribe(res => {
    console.log(res)
    if (res.success == "true") {
      this.submitted = false;
      this.ratingForm.reset();
      this.messageInfo.openSnackBar(res.message, 'Dismiss');
      this.router.navigate(['/settings/ratings']);
    }
  });
}

/***** on radio click *****/
onRadioClick(index, e) {
  console.log(index, e.target.value)
  let arr = this.ratingForm.controls['rating_options_attributes'] as FormArray;
  arr.valueChanges.subscribe(val => {
    this.radioDefault = val;
    for (let i = 0; i < this.radioDefault.length; i++) {
      if (index === i) {
        this.radioDefault[index]['default'] = true;
      } else {
        this.radioDefault[i]['default'] = false;
      }
    }
    console.log(this.radioDefault);
  });
}
/***** on radio click *****/

  createRatingListForm() {
    this.ratingListForm = this.fb.group({
      rating_type: new FormControl(this.listRating.name, [Validators.required]),
      choice: new FormControl(this.listRating.choice),
      attributes: new FormArray([])
    });
    this.loadFormList(this.listRating);
  }

  loadFormList(data){
     //create lines array first
     console.log(data)
     const linesFormArray = this.ratingListForm.get("attributes") as FormArray;
     for (let i = 0; i < data.rating_items.length; i++) {
    
      linesFormArray.push(this.fb.group({
        id:data.rating_items[i].id,
        name: data.rating_items[i].name,
      }));

    }
    console.log(linesFormArray);
    this.ratingListForm.setControl('attributes', linesFormArray);
  }
  createRatingItem(): FormGroup {
    return this.fb.group({
      name: new FormControl('', [Validators.required]),
    });

  }

  addRatingItem(): void {
    this.attributes = this.ratingListForm.get('attributes') as FormArray;
    this.attributes.push(this.createRatingItem());
  }

  removeRatingItem(i,item): void {
    console.log(i)
    console.log(item)
    this.attributes = this.ratingListForm.get('attributes') as FormArray;
    this.attributes.removeAt(i);
    this.deletedRow = [{...item}]
    console.log(this.deletedRow)
  }
  onListSubmit() {
    debugger
    this.rSubmitted = true;
    if (this.ratingListForm.invalid) {
      return false;
    }
    this.deletedRow.map(value=>{value['is_deleted']=true});
    let row = {
      rating_type: {
        "name": this.ratingListForm['controls'].rating_type.value,
        "choice": this.ratingListForm['controls'].choice.value,
        "category": "list",
        "rating_options_attributes": [...this.ratingListForm.value.attributes,...this.deletedRow]
      }
    }
    console.log(row)
    this.appService.editRating(this.r_id,row).subscribe(res => {
      if (res.success == 'true') {
        this.rSubmitted = false;
        this.ratingListForm.reset();
        this.messageInfo.openSnackBar(res.message, 'Dismiss');
        this.goBack();
      }
    });
  }

  // convenience getters for easy access to form fields
  get f() { return this.ratingForm.controls; }
  get rf() { return this.ratingListForm.controls; }


  goBack(){
    this.router.navigate(['/settings/ratings']);
  }

}
