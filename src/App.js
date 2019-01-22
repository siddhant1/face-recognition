import React, { Component } from "react";
import * as faceapi from "face-api.js";
class App extends Component {
  state = { image: "", distance: 0, isSid: false, isNik: false };

  async componentDidMount() {
    await Promise.all([
      faceapi.loadSsdMobilenetv1Model("models/"),
      faceapi.loadFaceLandmarkModel("models/"),
      faceapi.loadFaceRecognitionModel("models/")
    ]);
    const nik = await faceapi.fetchImage("/nik.jpg");
    const sid = await faceapi.fetchImage("/sid.jpg");
    const sidDescriptor = await faceapi.allFacesSsdMobilenetv1(sid);
    const nikDescriptor = await faceapi.allFacesSsdMobilenetv1(nik);

    const distance = faceapi.round(
      faceapi.euclideanDistance(
        sidDescriptor[0].descriptor,
        nikDescriptor[0].descriptor
      )
    );
  }

  checkFace = async _ => {
    const nik = await faceapi.fetchImage("/nik.jpg");
    const sid = await faceapi.fetchImage("/sid.jpg");
    const upload = await faceapi.fetchImage(this.state.image);
    const sidDescriptor = await faceapi.allFacesSsdMobilenetv1(sid);
    const nikDescriptor = await faceapi.allFacesSsdMobilenetv1(nik);
    const uploadDescriptor = await faceapi.allFacesSsdMobilenetv1(upload);
    const Siddistance = faceapi.round(
      faceapi.euclideanDistance(
        sidDescriptor[0].descriptor,
        uploadDescriptor[0].descriptor
      )
    );
    const Nikdistance = faceapi.round(
      faceapi.euclideanDistance(
        nikDescriptor[0].descriptor,
        uploadDescriptor[0].descriptor
      )
    );
    this.setState(current => {
      return {
        ...current,
        isSid: Siddistance < 0.6,
        isNik: Nikdistance < 0.6
      };
    });
  };

  uploadImage = async e => {
    this.setState(current => {
      return {
        ...current,
        isSid: false,
        isNik: false
      };
    });
    const files = e.target.files;
    const form = new FormData();
    form.append("file", files[0]);
    form.append("upload_preset", "Sick-fits");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dv95rctxg/image/upload",
      {
        method: "POST",
        body: form
      }
    ).then(d => d.json());
    this.setState(
      {
        image: res.secure_url
      },
      this.checkFace
    );
  };
  render() {
    return (
      <div>
        <label htmlFor="image">Upload Image</label>
        <input type="file" name="image" id="" onChange={this.uploadImage} />
        {this.state.isSid ? "He is Sid" : ""}
        {this.state.isNik ? "He is NIk" : ""}
        {!this.state.isNik && !this.state.isSid ? "None" : ""}
        {this.state.image && <img src={this.state.image} alt="test" />}
      </div>
    );
  }
}

export default App;
