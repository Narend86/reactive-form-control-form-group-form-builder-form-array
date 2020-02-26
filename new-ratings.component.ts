import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { AppService } from 'src/app/app-service/app.service';
import { MessageService } from 'src/app/_services/message.service';
@Component({
  selector: 'app-new-ratings',
  templateUrl: './new-ratings.component.html',
  styleUrls: ['./new-ratings.component.css']
})
export class NewRatingsComponent implements OnInit {
  ratingForm: FormGroup;
  ratingListForm:FormGroup;
  rating_options_attributes: FormArray;
  attributes:FormArray;
  submitted = false;
  rSubmitted = false;
  dValue = false;
  formattedMessage;
  radioDefault = [];

  constructor(private fb: FormBuilder, private appService: AppService, private messageInfo: MessageService) { }

  ngOnInit() {
    this.createForm();
    this.createRatingListForm();

  }

  createForm(): void {
    this.ratingForm = this.fb.group({
      rating_type: new FormControl('', [Validators.required]),
      rating_options_attributes: new FormArray([this.createItem(), this.createItem()])
    });
  }
  createRatingListForm(){
    this.ratingListForm = this.fb.group({
      rating_type: new FormControl('', [Validators.required]),
      choice: new FormControl(''),
      attributes: new FormArray([this.createRatingItem(),this.createRatingItem()])
    });
  }

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

  // convenience getters for easy access to form fields
  get f() { return this.ratingForm.controls; }
  get rf() {return this.ratingListForm.controls;}
  get ratingArray() { return this.f.attributes as FormArray; }

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

  removeItem(i): void {
    console.log(i)
    this.rating_options_attributes = this.ratingForm.get('rating_options_attributes') as FormArray;
    this.rating_options_attributes.removeAt(i)
    // this.attributes.push(this.createItem());
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
    let row = {
      rating_type: {
        "name": this.ratingForm['controls'].rating_type.value,
        "category": "percentage",
        "rating_options_attributes": this.ratingForm.value.rating_options_attributes
      }
    }
    console.log(row)
    this.appService.createRaing(row).subscribe(res => {
      if (res.success == true) {
        this.submitted = false;
        this.ratingForm.reset();
        this.messageInfo.openSnackBar(res.message, 'Dismiss');
      }
    });

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

  removeRatingItem(i): void {
    console.log(i)
    this.attributes = this.ratingListForm.get('attributes') as FormArray;
    this.attributes.removeAt(i)
  }
  onListSubmit(){
    debugger
    this.rSubmitted = true;
    if (this.ratingListForm.invalid) {
      return false;
    }
    let row = {
      rating_type: {
        "name": this.ratingListForm['controls'].rating_type.value,
        "choice":this.ratingListForm['controls'].choice.value,
        "category": "list",
        "rating_options_attributes": this.ratingListForm.value.attributes
      }
    }
    console.log(row)
    this.appService.createRaing(row).subscribe(res => {
      if (res.success == true) {
        this.rSubmitted = false;
        this.ratingListForm.reset();
        this.messageInfo.openSnackBar(res.message, 'Dismiss');
      }
    });
  }
}

