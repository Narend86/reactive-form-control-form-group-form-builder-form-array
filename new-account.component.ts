import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { AppService } from 'src/app/app-service/app.service';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.css']
})
export class NewAccountComponent implements OnInit {
  newAccountForm: FormGroup;
  public myModel = '';
  formatedAddress = '';
  @ViewChild("placesRef", { static: false }) placesRef: GooglePlaceDirective;
  // mask = numberMask;
  public mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  regions = [];
  latitude: number;
  longitute: number;
  constructor(private fb: FormBuilder, 
              public appService:AppService, 
              public messageInfo:MessageService,
              public dialogRef: MatDialogRef<NewAccountComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.regions = this.data.regions;
    this.createAccount();
  }


  createAccount(): void {
    this.newAccountForm = this.fb.group({
      name: new FormControl(''),
      account_number: new FormControl(''),
      address_attributes: this.fb.group({
        street: new FormControl(''),
        city: new FormControl({ value: '', disabled: true }),
        state: new FormControl({ value: '', disabled: true }),
        country: new FormControl({ value: '', disabled: true }),
        zip: new FormControl(''),
      }),
      region: new FormControl('')
    })
  }
  // convenience getter for easy access to form fields
  get f() { return this.newAccountForm.controls; }

  // options ={
  //   componentRestrictions:{
  //     country:['US']
  //   }
  // }
  public handleAddressChange(address: any) {
    // Do some stuff
    console.log(address)
      let addressComponent = address.address_components;
      let street = address.formatted_address;
      let city = '';
      let region = '';
      let country = '';
      let zip = '';
    for(let i =0; i < addressComponent.length;i++){
          for(let j=0;j<addressComponent[i].types.length; j++){
              if(addressComponent[i].types[0]==="locality"){
                city = addressComponent[i].long_name;
              }
              if(addressComponent[i].types[0]==="administrative_area_level_1"){
                region = addressComponent[i].long_name;
              }
              if(addressComponent[i].types[0]==="country"){
                country = addressComponent[i].long_name;
              }
              if(addressComponent[i].types[0]==="postal_code"){
                zip = addressComponent[i].long_name;
              }
          }
    }
    this.latitude = address.geometry.location.lat.call();
    this.longitute = address.geometry.location.lng.call();
    this.formatedAddress = address.formatted_address;
    this.newAccountForm.patchValue({
      address_attributes: {
        street:street,
        city: city,
        state: region,
        country: country,
        zip:zip
      }
    });
  }
  submitForm() {
    
    if (this.newAccountForm.invalid) {
      return false;
    }
    let account = {
      account:{
        name: this.newAccountForm.controls['name'].value,
        account_number: this.newAccountForm.controls['account_number'].value,
        region_id: this.newAccountForm.controls['region'].value,
        address_attributes: {
          city: this.newAccountForm.get('address_attributes.city').value,
          country: this.newAccountForm.get('address_attributes.country').value,
          formatted_address: this.newAccountForm.get('address_attributes.street').value,
          latitude: this.latitude,
          longitude: this.longitute,
          state: this.newAccountForm.get('address_attributes.state').value,
          zip: this.newAccountForm.get('address_attributes.zip').value
        }
      }
 
    }
    console.log(account)
    this.appService.createAccount(account).subscribe(res =>{
      if(res.success=='true'){
        this.dialogRef.close(res);
        this.messageInfo.openSnackBar(res.account.name +' '+ 'Created Successfully.','Dismiss')
      }
    });
    this.newAccountForm.reset();
  }
  close(flag) {
    this.dialogRef.close(flag);
  }
}
