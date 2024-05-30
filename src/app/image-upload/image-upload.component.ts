import { Component } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile, this.selectedFile.name);

      // Log the formData for demonstration purposes
      console.log(formData.get('image'));

      // Here you would send the formData to your backend
      // Example:
      // this.http.post('your-backend-url', formData).subscribe(response => {
      //   console.log(response);
      // });
    }
  }
}
