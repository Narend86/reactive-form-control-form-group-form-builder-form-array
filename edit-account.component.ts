import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'src/app/_services/message.service';
import { AppService } from 'src/app/app-service/app.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';


@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.css']
})
export class EditAccountComponent implements OnInit {
  @ViewChild("placesRef", { static: false }) placesRef: GooglePlaceDirective;
  regions = [];
  updateAccountForm: FormGroup;
  region;
  address;
  latitude: number;
  longitute: number;
  selected: string = '';
  account_id;
  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<EditAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private messageInfo: MessageService, private appService: AppService) {  }

  ngOnInit() {
    console.log(this.data)
    this.address = this.data.account_info.address;
    this.regions = this.data.regions;
    this.account_id = this.data.account_info.id;
    this.editAccount();
  }
 
  editAccount() {
     let obj = this.regions.findIndex(value => value.id == this.data.account_info.region_id);
     console.log(obj)
    this.updateAccountForm = this.fb.group({
      name: new FormControl(this.data.account_info.name),
      account_number: new FormControl(this.data.account_info.account_number),
      address_attributes: this.fb.group({
        street: new FormControl(),
        city: new FormControl({ value: '', disabled: true }),
        state: new FormControl({ value: '', disabled: true }),
        country: new FormControl({ value: '', disabled: true }),
        zip: new FormControl(''),
      }),
      region: new FormControl(this.regions[obj].id)
    })
   
      this.updateAccountForm.patchValue({
        address_attributes: {
          street: this.address.formatted_address,
          city: this.address.city,
          state: this.address.state,
          country: this.address.country,
          zip: this.address.zip,
        },
      })
    
  }
  // convenience getter for easy access to form fields
  get f() { return this.updateAccountForm.controls; }

  public handleAddressChange(address: any) {
    // Do some stuff
    console.log(address)
    let addressComponent = address.address_components;
    let street = address.formatted_address;
    let city = '';
    let region = '';
    let country = '';
    let zip = '';
    for (let i = 0; i < addressComponent.length; i++) {
      for (let j = 0; j < addressComponent[i].types.length; j++) {
        if (addressComponent[i].types[0] === "locality") {
          city = addressComponent[i].long_name;
        }
        if (addressComponent[i].types[0] === "administrative_area_level_1") {
          region = addressComponent[i].long_name;
        }
        if (addressComponent[i].types[0] === "country") {
          country = addressComponent[i].long_name;
        }
        if (addressComponent[i].types[0] === "postal_code") {
          zip = addressComponent[i].long_name;
        }
      }
    }
    this.latitude = address.geometry.location.lat.call();
    this.longitute = address.geometry.location.lng.call();
    this.updateAccountForm.patchValue({
      address_attributes: {
        street: street,
        city: city,
        state: region,
        country: country,
        zip: zip
      }
    });
  }

  submitForm() {

    if (this.updateAccountForm.invalid) {
      return false;
    }
    let account = {
      account: {
        name: this.updateAccountForm.controls['name'].value,
        account_number: this.updateAccountForm.controls['account_number'].value,
        region_id: this.updateAccountForm.controls['region'].value,
        address_attributes: {
          city: this.updateAccountForm.get('address_attributes.city').value,
          country: this.updateAccountForm.get('address_attributes.country').value,
          formatted_address: this.updateAccountForm.get('address_attributes.street').value,
          latitude: this.latitude ? this.latitude : this.address.latitude,
          longitude: this.longitute ? this.latitude : this.address.longitude,
          state: this.updateAccountForm.get('address_attributes.state').value,
          zip: this.updateAccountForm.get('address_attributes.zip').value
        }
      }

    }

    this.appService.editAccount(this.account_id, account).subscribe(res => {
      if (res.success == 'true') {
        this.dialogRef.close(res);
        this.messageInfo.openSnackBar(res.account.name + ' ' + 'Updated Successfully.', 'Dismiss')
      }
    });
    this.updateAccountForm.reset();
  }

  close(flag) {
    this.dialogRef.close(flag);
  }
}
