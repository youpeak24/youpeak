import { Box, Modal } from "@mui/material";
import { styled } from '@mui/material/styles';
import { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { uploadFile } from "../../util/AwsFunction";

import Button from "../extra/Button";
import Input from "../extra/Input";
import {
  createContactUs,
  updateContactUs,
} from "../store/contactUs/contactUs.action";
import { CLOSE_DIALOGUE } from "../store/dialogue/dialogue.type";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  borderRadius: "13px",
  border: "1px solid #C9C9C9",
  boxShadow: 24,
  p: "19px",
};

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function CreateContactUs(props) {
  const { dialogue, dialogueType, dialogueData } = useSelector((state) => state.dialogue);

  const [contactUsDialogue, setContactUsDialogue] = useState(false);
  const [name, setName] = useState();
  const [imgApi, setImgApi] = useState();
  const [imageFileData, setImageFileData] = useState(null);
  const [image, setImage] = useState(); // Actual image URL
  const [link, setLink] = useState();
  const [error, setError] = useState({
    name: "",
    image: "",
    link: ""
  });

  const dispatch = useDispatch();

  useEffect(() => {
    setContactUsDialogue(dialogue);
    setName(dialogueData?.name);
    setLink(dialogueData?.link);
    setImgApi(dialogueData?.image);
    setImage(dialogueData?.image); // set image from existing data
  }, [dialogue, dialogueData]);

  const handleCloseAddCategory = () => {
    setContactUsDialogue(false);
    dispatch({
      type: CLOSE_DIALOGUE,
      payload: {
        dialogue: false,
      },
    });

    sessionStorage.setItem("dialogueData", JSON.stringify({ dialogue: false }));
  };

  const handleImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImageFileData(selectedFile);
      setImgApi(URL.createObjectURL(selectedFile)); // For preview
    }
  };

  const folderStructure = "userImage";

  const handleFileUpload = async (file) => {

    if (!file) {
      setError((prev) => ({ ...prev, image: "Image Is Required" }));
      return null;
    }

    const { resDataUrl } = await uploadFile(file, folderStructure, dispatch, "imageLoader");
    setImgApi(resDataUrl);
    setImage(resDataUrl); // This is what you'll store in DB

    setError((prev) => ({ ...prev, image: "" }));

    return resDataUrl;
  };

  const isValidURL = (url) => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  };

  const handleSubmit = async () => {

    let linkValid = link ? isValidURL(link) : false;

    // Step 1: Local validation before upload
    let validationErrors = {};
    if (!name) validationErrors.name = "Name Is Required!";
    if (!link) validationErrors.link = "Link Is Required!";
    else if (!linkValid) validationErrors.link = "Link Invalid!";

    // Don’t check for image yet if you're about to upload it
    if (!dialogueData && !imageFileData) {
      validationErrors.image = "Image Is Required!";
    }

    if (Object.keys(validationErrors).length > 0) {
      return setError(validationErrors);
    }

    // Step 2: Upload the image if new file is selected
    let finalImageUrl = image;
    if (imageFileData) {
      finalImageUrl = await handleFileUpload(imageFileData);
    }

    // Step 3: Final payload
    const contactPayload = {
      name: name.trim(),
      // image: finalImageUrl,
      link: link.trim(),
    };

    if (imageFileData) contactPayload.image = finalImageUrl;

    // Step 4: Create or update
    if (dialogueData) {
      props.updateContactUs(contactPayload, dialogueData?._id);
    } else {
      props.createContactUs(contactPayload);
    }

    handleCloseAddCategory();
  };


  return (
    <div>
      <Modal
        open={contactUsDialogue}
        onClose={handleCloseAddCategory}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="model-style">
          <div className="model-header">
            <p className="m-0">
              {dialogueData ? "Update Contact Us" : "Create Contact Us"}
            </p>
          </div>
          <div className="model-body">
            <form>
              <Input
                label={"Name"}
                name={"name"}
                placeholder={"Enter Name"}
                value={name}
                errorMessage={error.name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError((prev) => ({ ...prev, name: e.target.value ? "" : "Name Is Required" }));
                }}
              />

              <div className="mt-2 add-links">
                <Input
                  label={"Link"}
                  name={"link"}
                  placeholder={"Enter Link"}
                  value={link}
                  errorMessage={error.link}
                  onChange={(e) => {
                    setLink(e.target.value);
                    setError((prev) => ({ ...prev, link: "" }));
                  }}
                />
              </div>

              <div className="mt-2">
                <Input
                  type="file"
                  label="Image"
                  accept=".png, .jpg, .jpeg"
                  errorMessage={error.image}
                  onChange={handleImage}
                />
                <p className="extention-show">Accept only .jpg, .jpeg, .png</p>
              </div>

              <div className="mt-2 fake-create-img mb-2">
                {imgApi && (
                  <img
                    src={imgApi}
                    alt="preview"
                    style={{ width: "96px", height: "auto", objectFit: "contain" }}
                  />
                )}
              </div>


            </form>
          </div>
          <div className="model-footer">
            <div className="m-3 d-flex justify-content-end">
              <Button
                onClick={handleCloseAddCategory}
                btnName="Close"
                newClass="close-model-btn me-2"
              />
              <Button
                onClick={handleSubmit}
                btnName="Submit"
                type="button"
                newClass="submit-btn"
              />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default connect(null, {
  createContactUs,
  updateContactUs,
})(CreateContactUs);
