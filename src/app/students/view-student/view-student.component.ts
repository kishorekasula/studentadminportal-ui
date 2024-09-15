import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Gender } from 'src/app/models/ui-models/gender.model';
import { Student } from 'src/app/models/ui-models/student.model';
import { GenderService } from 'src/app/services/gender.service';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})

export class ViewStudentComponent implements OnInit {
  studentId: string | null | undefined;
  student: Student = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: 0,
    genderId: '',
    profileImageUrl: '',
    gender: {
      id: '',
      description: ''
    },
    address: {
      id: '',
      physicalAddress: '',
      postalAddress: ''
    }
  };

  showPopup: boolean = false; 
  showDeletePopup: boolean = false; 
  showSuccessPopup: boolean = false; 
  isNewStudent = false;
  header = '';
  displayProfileImageUrl = '';

  genderList: Gender[] = [];

  @ViewChild('studentDetailsForm') studentDetailsForm?: NgForm;

  constructor(private readonly studentService: StudentService,
    private readonly route: ActivatedRoute,
    private readonly genderService: GenderService,
    private snackbar: MatSnackBar,
    private router: Router) { }


  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        debugger;
        this.studentId = params.get('id');

        if (this.studentId) {
          if (this.studentId.toLowerCase() === 'Add'.toLowerCase()) {
            // -> new Student Functionality
            this.isNewStudent = true;
            this.header = 'Add New Student';
            this.setImage();
          } else {
            // -> Existing Student Functionality
            this.isNewStudent = false;
            this.header = 'Edit Student';
            this.studentService.getStudent(this.studentId)
              .subscribe(
                (successResponse) => {
                  debugger;
                  this.student = successResponse;
                  this.setImage();
                },
                (errorResponse) => {
                  this.setImage();
                }
              );
          }

          this.genderService.getGenderList()
            .subscribe(
              (successResponse) => {
                debugger;
                this.genderList = successResponse;
              }
            );
        }
      }
    );
  }

  onUpdate(): void {
    debugger;
    if (this.studentDetailsForm?.form.valid) {
      this.studentService.updateStudent(this.student.id, this.student)
        .subscribe(
          (successResponse) => {
            debugger;
            // Show the success popup instead of snackbar
            this.showPopup = true;
          },
          (errorResponse) => {
            // Log the error
            console.log(errorResponse);
          }
        );
    }
  }
  
  closePopup(): void {
    this.showPopup = false;
  }
  

  onDelete(): void {
    this.showDeletePopup = true;  // Show the confirmation popup
  }

  // Close delete confirmation popup without deleting
  closeDeletePopup(): void {
    this.showDeletePopup = false;  // Hide the confirmation popup
  }

  // Close the success message popup after confirming the deletion
  closeSuccessPopup(): void {
    this.showSuccessPopup = false;  // Hide the success message popup
    this.router.navigateByUrl('students');  // Redirect to the students list
  }

  // Method to confirm deletion
  confirmDelete(): void {
    this.studentService.deleteStudent(this.student.id)
      .subscribe(
        (successResponse) => {
          // Close the delete confirmation popup
          this.showDeletePopup = false;

          // Show success message popup
          this.showSuccessPopup = true;

          // Optionally, use setTimeout to hide success popup after some time
          setTimeout(() => {
            this.closeSuccessPopup();  // Close the popup and redirect
          }, 2000);
        },
        (errorResponse) => {
          console.error('Error deleting student:', errorResponse);
        }
      );
  }

  onAdd(): void {
    debugger;
    if (this.studentDetailsForm?.form.valid) {
      // Submit form date to api
      this.studentService.addStudent(this.student)
        .subscribe(
          (successResponse) => {
            debugger;
            this.snackbar.open('Student added successfully', undefined, {
              duration: 2000
            });

            setTimeout(() => {
              this.router.navigateByUrl(`students/${successResponse.id}`);
            }, 2000);

          },
          (errorResponse) => {
            // Log
            console.log(errorResponse);
          }
        );
    }
  }

  uploadImage(event: any): void {
    debugger;
    if (this.studentId) {
      const file: File = event.target.files[0];
      this.studentService.uploadImage(this.student.id, file)
        .subscribe(
          (successResponse) => {
            debugger;
            this.student.profileImageUrl = successResponse;
            this.setImage();

            // Show a notification
            this.snackbar.open('Profile Image Updated', undefined, {
              duration: 2000
            });

          },
          (errorResponse) => {

          }
        );

    }

  }

  private setImage(): void {
    if (this.student.profileImageUrl) {
      this.displayProfileImageUrl = this.studentService.getImagePath(this.student.profileImageUrl);
    } else {
      // Display a default
      this.displayProfileImageUrl = '/assets/user.png';
    }
  }
}
